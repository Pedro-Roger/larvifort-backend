/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { AppointmentsController } from '../src/modules/appointments/presentation/appointments.controller';
import { TasksController } from '../src/modules/tasks/presentation/tasks.controller';
import { ListAppointmentsUseCase } from '../src/modules/appointments/application/list-appointments.usecase';
import { GetAppointmentByIdUseCase } from '../src/modules/appointments/application/get-appointment-by-id.usecase';
import { CreateAppointmentUseCase } from '../src/modules/appointments/application/create-appointment.usecase';
import { UpdateAppointmentUseCase } from '../src/modules/appointments/application/update-appointment.usecase';
import { DeleteAppointmentUseCase } from '../src/modules/appointments/application/delete-appointment.usecase';
import { GetCalendarUseCase } from '../src/modules/appointments/application/get-calendar.usecase';
import { ListTasksUseCase } from '../src/modules/tasks/application/list-tasks.usecase';
import { GetTaskByIdUseCase } from '../src/modules/tasks/application/get-task-by-id.usecase';
import { CreateTaskUseCase } from '../src/modules/tasks/application/create-task.usecase';
import { UpdateTaskUseCase } from '../src/modules/tasks/application/update-task.usecase';
import { UpdateTaskStatusUseCase } from '../src/modules/tasks/application/update-task-status.usecase';
import { DeleteTaskUseCase } from '../src/modules/tasks/application/delete-task.usecase';
import { ListProjectsUseCase } from '../src/modules/tasks/application/list-projects.usecase';
import { ConfirmTaskActivityUseCase } from '../src/modules/tasks/application/confirm-task-activity.usecase';
import { APPOINTMENT_REPOSITORY_PORT } from '../src/modules/appointments/application/ports/appointment-repository.port';
import { CLIENT_REPOSITORY_PORT } from '../src/modules/clients/application/ports/client-repository.port';
import { TASK_REPOSITORY_PORT } from '../src/modules/tasks/application/ports/task-repository.port';
import { PROJECT_REPOSITORY_PORT } from '../src/modules/tasks/application/ports/project-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from '../src/modules/tasks/application/ports/project-column-repository.port';
import { RULES_ENGINE_PORT } from '../src/modules/rules/application/ports/rules-engine.port';
import { AUTOMATION_OUTBOX_PORT } from '../src/modules/automations/application/ports/automation-outbox.port';
import { AUTOMATION_REPOSITORY_PORT } from '../src/modules/automations/application/ports/automation-repository.port';
import { TaskAutomationActionService } from '../src/modules/automations/infra/task-automation-action.service';
import { createOpenApiDocument } from '../src/swagger';
import { ConfirmActivityDto } from '../src/modules/tasks/presentation/dto/confirm-activity.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Task } from '../src/modules/tasks/domain/task';

type SuperTestHttp = ReturnType<typeof request>;

/**
 * API-014 — Fluxo completo compromisso → outbox → automação → card COMPROMISSO → confirmação.
 * Cobre critérios 1-9 da spec 05 e valida migrations, contratos DTO e Swagger.
 */
describe('Appointment → Kanban → Check-in Integration (API-014 e2e)', () => {
  const JWT_SECRET = 'lavifort-api-014-secret';

  function makeToken(role: 'ADMIN' | 'USER' = 'USER', userId = 'u-1'): string {
    return jwt.sign(
      { sub: userId, email: 'user@lavifort.com.br', role },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
  }

  // ---------------------------------------------------------------------------
  // 1. Migrations e Schema
  // ---------------------------------------------------------------------------
  describe('Migrations e Schema Prisma', () => {
    it('existe migration 0005 com Task tipo/compromisso e TaskActivityConfirmation', () => {
      const migPath = path.join(
        process.cwd(),
        'knex/migrations/0005_appointments_kanban_integration.ts',
      );
      expect(fs.existsSync(migPath)).toBe(true);
      const content = fs.readFileSync(migPath, 'utf8');
      expect(content).toContain('tipo');
      expect(content).toContain('appointmentId');
      expect(content).toContain('clienteId');
      expect(content).toContain('TaskActivityConfirmation');
      expect(content).toContain('confirmedAt');
      expect(content).toContain('latitude');
      expect(content).toContain('longitude');
      expect(content).toContain('accuracyMeters');
    });

    it('migration 0004 inclui APPOINTMENT_CREATED nos triggers', () => {
      const migPath = path.join(
        process.cwd(),
        'knex/migrations/0004_automations.ts',
      );
      const content = fs.readFileSync(migPath, 'utf8');
      expect(content).toContain('APPOINTMENT_CREATED');
    });

    it('schema.prisma contém modelos e índices esperados', () => {
      const schema = fs.readFileSync(
        path.join(process.cwd(), 'prisma/schema.prisma'),
        'utf8',
      );
      expect(schema).toContain('model Task');
      expect(schema).toContain('tipo');
      expect(schema).toContain('appointmentId');
      expect(schema).toContain('model TaskActivityConfirmation');
      expect(schema).toContain('confirmedById');
      expect(schema).toContain('enum AutomationTrigger');
      expect(schema).toContain('APPOINTMENT_CREATED');
      expect(schema).toContain('TipoTask');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Contratos DTO e Swagger
  // ---------------------------------------------------------------------------
  describe('Contratos DTO e Swagger', () => {
    it('CreateAppointmentDto exige clienteId e valida tipo', async () => {
      const dto = plainToInstance(
        (
          await import('../src/modules/appointments/presentation/dto/create-appointment.dto')
        ).CreateAppointmentDto,
        {
          tipo: 'VISITA',
          titulo: '',
          data: 'invalid',
          clienteId: '',
        },
      );
      const errors = await validate(dto);
      // titulo vazio, data inválida, clienteId vazio => deve ter erros
      expect(errors.length).toBeGreaterThan(0);
      const fields = errors.map((e) => e.property);
      expect(fields).toEqual(
        expect.arrayContaining(['titulo', 'data', 'clienteId']),
      );
    });

    it('ConfirmActivityDto valida latitude/longitude/accuracy', async () => {
      const dto = plainToInstance(ConfirmActivityDto, {
        latitude: 120, // inválido >90
        longitude: -200, // inválido
        accuracyMeters: -5, // inválido
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const fields = errors.map((e) => e.property);
      expect(fields).toEqual(
        expect.arrayContaining(['latitude', 'longitude', 'accuracyMeters']),
      );
    });

    it('ConfirmActivityDto aceita payload válido', async () => {
      const dto = plainToInstance(ConfirmActivityDto, {
        latitude: -3.7319,
        longitude: -38.5267,
        accuracyMeters: 15.5,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('OpenAPI contém POST /appointments e POST /tasks/:id/confirm-activity', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AppointmentsController, TasksController],
        providers: [
          {
            provide: ListAppointmentsUseCase,
            useValue: { execute: jest.fn() },
          },
          {
            provide: GetAppointmentByIdUseCase,
            useValue: { execute: jest.fn() },
          },
          {
            provide: CreateAppointmentUseCase,
            useValue: { execute: jest.fn() },
          },
          {
            provide: UpdateAppointmentUseCase,
            useValue: { execute: jest.fn() },
          },
          {
            provide: DeleteAppointmentUseCase,
            useValue: { execute: jest.fn() },
          },
          { provide: GetCalendarUseCase, useValue: { execute: jest.fn() } },
          { provide: ListTasksUseCase, useValue: { execute: jest.fn() } },
          { provide: GetTaskByIdUseCase, useValue: { execute: jest.fn() } },
          { provide: CreateTaskUseCase, useValue: { execute: jest.fn() } },
          { provide: UpdateTaskUseCase, useValue: { execute: jest.fn() } },
          {
            provide: UpdateTaskStatusUseCase,
            useValue: { execute: jest.fn() },
          },
          { provide: DeleteTaskUseCase, useValue: { execute: jest.fn() } },
          { provide: ListProjectsUseCase, useValue: { execute: jest.fn() } },
          {
            provide: ConfirmTaskActivityUseCase,
            useValue: { execute: jest.fn() },
          },
          { provide: APPOINTMENT_REPOSITORY_PORT, useValue: {} },
          { provide: CLIENT_REPOSITORY_PORT, useValue: {} },
          { provide: TASK_REPOSITORY_PORT, useValue: {} },
          { provide: PROJECT_REPOSITORY_PORT, useValue: {} },
          { provide: PROJECT_COLUMN_REPOSITORY_PORT, useValue: {} },
          { provide: RULES_ENGINE_PORT, useValue: { evaluate: jest.fn() } },
        ],
      }).compile();

      const app = module.createNestApplication();
      app.setGlobalPrefix('api/v1');
      const document = createOpenApiDocument(app);
      await app.close();

      const paths = Object.keys(document.paths);
      // Verifica que compromissos e confirmação estão documentados
      const hasAppointments = paths.some((p) => p.includes('/appointments'));
      const hasCompromissosAlias = paths.some((p) =>
        p.includes('/compromissos'),
      );
      expect(hasAppointments || hasCompromissosAlias).toBe(true);

      const hasConfirm = paths.some(
        (p) => p.includes('confirm-activity') || p.includes('checkin'),
      );
      expect(hasConfirm).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Criação de compromisso vinculada a cliente real (via HTTP)
  // ---------------------------------------------------------------------------
  describe('POST /api/v1/appointments — compromisso vinculado a cliente', () => {
    let app: INestApplication<App>;
    let http: SuperTestHttp;
    let createMock: jest.Mock;
    let findClientByIdMock: jest.Mock;
    let findAutomationsMock: jest.Mock;
    let publishMock: jest.Mock;

    const SAMPLE_CLIENT = {
      id: 'client-1',
      firstName: 'João',
      lastName: 'Silva',
      endereco: 'Rua Exemplo, 123',
      cidade: 'Aracati',
      uf: 'CE',
      empresaId: 'emp-1',
    };

    const SAMPLE_APPOINTMENT = {
      id: 'app-1',
      tipo: 'VISITA' as const,
      titulo: 'Visita Técnica Fazenda',
      data: new Date(Date.now() + 86400000),
      horario: '14:00',
      endereco: 'Rodovia CE-040 km 30',
      observacoes: 'Levar amostras',
      clienteId: 'client-1',
      empresaId: 'emp-1',
      ownerId: 'u-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(async () => {
      process.env.JWT_SECRET = JWT_SECRET;
      createMock = jest.fn().mockResolvedValue(SAMPLE_APPOINTMENT);
      findClientByIdMock = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
      findAutomationsMock = jest.fn().mockResolvedValue([
        {
          id: 'auto-1',
          projetoId: 'proj-1',
          trigger: 'APPOINTMENT_CREATED',
          actions: [
            {
              type: 'CREATE_APPOINTMENT_TASK',
              params: { targetColumnId: 'col-agenda' },
            },
          ],
        },
      ]);
      publishMock = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [AppointmentsController],
        providers: [
          ListAppointmentsUseCase,
          GetAppointmentByIdUseCase,
          CreateAppointmentUseCase,
          UpdateAppointmentUseCase,
          DeleteAppointmentUseCase,
          GetCalendarUseCase,
          {
            provide: CLIENT_REPOSITORY_PORT,
            useValue: { findById: findClientByIdMock },
          },
          {
            provide: APPOINTMENT_REPOSITORY_PORT,
            useValue: {
              findMany: jest.fn().mockResolvedValue({ data: [], total: 0 }),
              findById: jest.fn(),
              create: createMock,
              update: jest.fn(),
              delete: jest.fn(),
              countByDay: jest.fn(),
            },
          },
          {
            provide: AUTOMATION_REPOSITORY_PORT,
            useValue: { findActiveByTrigger: findAutomationsMock },
          },
          {
            provide: AUTOMATION_OUTBOX_PORT,
            useValue: { publish: publishMock },
          },
        ],
      }).compile();

      app = module.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
      );
      await app.init();
      http = request(app.getHttpServer());
    });

    afterEach(async () => {
      await app.close();
    });

    it('critério 1: cria compromisso com cliente real e herda empresaId', async () => {
      const token = makeToken();
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      const res = await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'VISITA',
          titulo: 'Visita Técnica Fazenda',
          data: tomorrow,
          clienteId: 'client-1',
          horario: '14:00',
          endereco: 'Rodovia CE-040 km 30',
        })
        .expect(201);

      expect(res.body.clienteId).toBe('client-1');
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ clienteId: 'client-1', empresaId: 'emp-1' }),
      );
      expect(publishMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'APPOINTMENT_CREATED',
          projetoId: 'proj-1',
        }),
      );
    });

    it('critério 5: sem automação ativa cria compromisso sem publicar e sem erro', async () => {
      findAutomationsMock.mockResolvedValueOnce([]);
      const token = makeToken();
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'REUNIAO',
          titulo: 'Reunião sem automação',
          data: tomorrow,
          clienteId: 'client-1',
        })
        .expect(201);

      expect(publishMock).not.toHaveBeenCalled();
    });

    it('critério 2: empresaId enviado como clienteId retorna 404', async () => {
      findClientByIdMock.mockResolvedValueOnce(null);
      const token = makeToken();
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'VISITA',
          titulo: 'Visita inválida',
          data: tomorrow,
          clienteId: 'emp-1', // ID de empresa, não cliente
          endereco: 'Rua X',
        })
        .expect(404);
    });

    it('retorna 400 quando clienteId ausente', async () => {
      const token = makeToken();
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'REUNIAO',
          titulo: 'Sem cliente',
          data: tomorrow,
        })
        .expect(400);
    });

    it('retorna 401 sem token', async () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer invalid`)
        .send({
          tipo: 'VISITA',
          titulo: 'Visita',
          data: tomorrow,
          clienteId: 'client-1',
          endereco: 'Rua X',
        })
        .expect(401);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Worker de automação: CREATE_APPOINTMENT_TASK idempotente
  // ---------------------------------------------------------------------------
  describe('Automação CREATE_APPOINTMENT_TASK — idempotência e projeção', () => {
    it('critério 3: cria card COMPROMISSO na coluna configurada com cliente e atividade', async () => {
      const prismaMock = {
        task: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 't-1' }),
          update: jest.fn(),
        },
      };
      const service = new TaskAutomationActionService(prismaMock);

      await service.execute(
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-agenda' },
        },
        {
          id: 'evt-1',
          type: 'APPOINTMENT_CREATED',
          projetoId: 'proj-1',
          aggregateId: 'app-1',
          payload: {
            appointmentId: 'app-1',
            clienteId: 'client-1',
            titulo: 'Visita Técnica Fazenda',
            tipo: 'VISITA',
            data: '2026-10-15T14:00:00.000Z',
            horario: '14:00',
            endereco: 'Rodovia CE-040 km 30',
            observacoes: 'Levar amostras',
          },
          depth: 0,
          causationChain: [],
          occurredAt: new Date(),
        },
      );

      expect(prismaMock.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projetoId: 'proj-1',
            columnId: 'col-agenda',
            tipo: 'COMPROMISSO',
            appointmentId: 'app-1',
            clienteId: 'client-1',
            titulo: 'Visita Técnica Fazenda',
            tags: ['COMPROMISSO'],
          }),
        }),
      );
    });

    it('critério 4: retry não duplica card (idempotência por appointmentId+projetoId)', async () => {
      const prismaMock = {
        task: {
          findFirst: jest.fn().mockResolvedValue({ id: 'existing' }),
          create: jest.fn(),
          update: jest.fn(),
        },
      };
      const service = new TaskAutomationActionService(prismaMock);

      await service.execute(
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-agenda' },
        },
        {
          id: 'evt-1-retry',
          type: 'APPOINTMENT_CREATED',
          projetoId: 'proj-1',
          aggregateId: 'app-1',
          payload: {
            appointmentId: 'app-1',
            clienteId: 'client-1',
            titulo: 'Visita',
          },
          depth: 0,
          causationChain: [],
          occurredAt: new Date(),
        },
      );

      expect(prismaMock.task.findFirst).toHaveBeenCalledWith({
        where: { appointmentId: 'app-1', projetoId: 'proj-1' },
      });
      expect(prismaMock.task.create).not.toHaveBeenCalled();
    });

    it('projetos distintos com automações ativas geram cards independentes', async () => {
      const prismaMock = {
        task: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 't-1' }),
          update: jest.fn(),
        },
      };
      const service = new TaskAutomationActionService(prismaMock);

      const payload = {
        appointmentId: 'app-1',
        clienteId: 'client-1',
        titulo: 'Visita',
      };

      await service.execute(
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-1' },
        },
        {
          id: 'evt-proj-1',
          type: 'APPOINTMENT_CREATED',
          projetoId: 'proj-1',
          aggregateId: 'app-1',
          payload,
          depth: 0,
          causationChain: [],
          occurredAt: new Date(),
        },
      );
      await service.execute(
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-2' },
        },
        {
          id: 'evt-proj-2',
          type: 'APPOINTMENT_CREATED',
          projetoId: 'proj-2',
          aggregateId: 'app-1',
          payload,
          depth: 0,
          causationChain: [],
          occurredAt: new Date(),
        },
      );

      expect(prismaMock.task.create).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Confirmação de atividade — POST /tasks/:id/confirm-activity
  // ---------------------------------------------------------------------------
  describe('POST /api/v1/tasks/:id/confirm-activity — confirmação auditável', () => {
    let app: INestApplication<App>;
    let http: SuperTestHttp;
    let findByIdMock: jest.Mock;
    let confirmMock: jest.Mock;
    let findConfirmationMock: jest.Mock;

    const SAMPLE_CONFIRMATION = {
      id: 'conf-1',
      taskId: 't-comp',
      confirmedById: 'u-1',
      confirmedAt: new Date('2026-10-15T14:30:00.000Z'),
      latitude: -3.7319,
      longitude: -38.5267,
      accuracyMeters: 15.5,
      createdAt: new Date('2026-10-15T14:30:00.000Z'),
    };

    const COMPROMISSO_TASK: Task = {
      id: 't-comp',
      projetoId: 'proj-1',
      columnId: 'col-1',
      titulo: 'Visita Técnica Fazenda',
      descricao:
        'Compromisso agendado para 15/10/2026 às 14:00. Endereço: Rodovia CE-040',
      status: 'EM_ANDAMENTO',
      tipo: 'COMPROMISSO',
      appointmentId: 'app-1',
      clienteId: 'client-1',
      confirmation: null,
      prioridade: 'MEDIA',
      progresso: 0,
      tags: ['COMPROMISSO'],
      prazo: null,
      estimativaH: null,
      assigneeId: 'u-1',
      createdAt: new Date('2026-10-01'),
      updatedAt: new Date('2026-10-02'),
    } as unknown as Task;

    const GERAL_TASK: Task = {
      ...COMPROMISSO_TASK,
      id: 't-geral',
      tipo: 'GERAL',
      appointmentId: null,
      clienteId: null,
      tags: [],
    } as unknown as Task;

    beforeEach(async () => {
      process.env.JWT_SECRET = JWT_SECRET;
      findByIdMock = jest.fn().mockResolvedValue(COMPROMISSO_TASK);
      confirmMock = jest.fn().mockResolvedValue(SAMPLE_CONFIRMATION);
      findConfirmationMock = jest.fn().mockResolvedValue(null);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [TasksController],
        providers: [
          ListTasksUseCase,
          GetTaskByIdUseCase,
          CreateTaskUseCase,
          UpdateTaskUseCase,
          UpdateTaskStatusUseCase,
          DeleteTaskUseCase,
          ListProjectsUseCase,
          ConfirmTaskActivityUseCase,
          {
            provide: TASK_REPOSITORY_PORT,
            useValue: {
              findMany: jest.fn(),
              findById: findByIdMock,
              findByAppointmentId: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              confirmActivity: confirmMock,
              findConfirmationByTaskId: findConfirmationMock,
            },
          },
          {
            provide: PROJECT_REPOSITORY_PORT,
            useValue: {
              findById: jest
                .fn()
                .mockResolvedValue({ id: 'proj-1', name: 'Proj' }),
              findAll: jest.fn(),
              findByName: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
          {
            provide: PROJECT_COLUMN_REPOSITORY_PORT,
            useValue: {
              findById: jest.fn().mockResolvedValue({
                id: 'col-1',
                projetoId: 'proj-1',
                title: 'Agenda',
                order: 0,
              }),
              findByProjectId: jest.fn().mockResolvedValue([]),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              reorder: jest.fn(),
            },
          },
          {
            provide: RULES_ENGINE_PORT,
            useValue: {
              evaluate: jest.fn().mockResolvedValue({
                allowed: true,
                requiredFields: [],
                setFields: {},
                triggeredAutomations: [],
                blockingRules: [],
              }),
            },
          },
        ],
      }).compile();

      app = module.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
      );
      await app.init();
      http = request(app.getHttpServer());
    });

    afterEach(async () => {
      await app.close();
    });

    it('critério 6: confirmação válida grava usuário, horário do servidor, coordenadas e precisão', async () => {
      const token = makeToken('USER', 'u-1');
      const before = Date.now();
      const res = await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(201);

      expect(res.body.id).toBe('conf-1');
      expect(res.body.latitude).toBe(-3.7319);
      expect(confirmMock).toHaveBeenCalledWith(
        't-comp',
        expect.objectContaining({
          confirmedById: 'u-1',
          latitude: -3.7319,
          longitude: -38.5267,
          accuracyMeters: 15.5,
          confirmedAt: expect.any(Date),
        }),
      );
      const confirmedAt = new Date(
        confirmMock.mock.calls[0][1].confirmedAt,
      ).getTime();
      expect(confirmedAt).toBeGreaterThanOrEqual(before);
    });

    it('alias POST /tasks/:id/checkin também confirma', async () => {
      const token = makeToken('USER', 'u-1');
      const res = await http
        .post('/api/v1/tasks/t-comp/checkin')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 10 })
        .expect(201);

      expect(res.body.id).toBe('conf-1');
    });

    it('critério 7: segunda confirmação retorna 409 e preserva original', async () => {
      findConfirmationMock.mockResolvedValueOnce(SAMPLE_CONFIRMATION);
      findByIdMock.mockResolvedValueOnce({
        ...COMPROMISSO_TASK,
        confirmation: SAMPLE_CONFIRMATION,
      });
      const token = makeToken('USER', 'u-1');
      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(409);

      expect(confirmMock).not.toHaveBeenCalled();
    });

    it('critério 8a: task GERAL não confirma (400)', async () => {
      findByIdMock.mockResolvedValueOnce(GERAL_TASK);
      const token = makeToken('USER', 'u-1');
      await http
        .post('/api/v1/tasks/t-geral/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(400);
    });

    it('critério 8b: usuário sem permissão (não assignee, não ADMIN) retorna 403', async () => {
      findByIdMock.mockResolvedValueOnce({
        ...COMPROMISSO_TASK,
        assigneeId: 'outro-user',
      });
      const token = makeToken('USER', 'u-1');
      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(403);
    });

    it('critério 8c: ADMIN pode confirmar mesmo sem ser assignee', async () => {
      findByIdMock.mockResolvedValueOnce({
        ...COMPROMISSO_TASK,
        assigneeId: 'outro-user',
      });
      const token = makeToken('ADMIN', 'admin-1');
      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(201);
    });

    it('critério 8d: coordenada inválida retorna 400', async () => {
      const token = makeToken('USER', 'u-1');
      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: 120, longitude: -38.5267, accuracyMeters: 15.5 })
        .expect(400);

      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.73, longitude: 200, accuracyMeters: 15.5 })
        .expect(400);

      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.73, longitude: -38.5, accuracyMeters: -1 })
        .expect(400);
    });

    it('retorna 401 sem token', async () => {
      await http
        .post('/api/v1/tasks/t-comp/confirm-activity')
        .send({ latitude: -3.73, longitude: -38.5, accuracyMeters: 12 })
        .expect(401);
    });

    it('retorna 404 quando task não existe', async () => {
      findByIdMock.mockResolvedValueOnce(null);
      const token = makeToken('USER', 'u-1');
      await http
        .post('/api/v1/tasks/ghost/confirm-activity')
        .set('Authorization', `Bearer ${token}`)
        .send({ latitude: -3.73, longitude: -38.5, accuracyMeters: 12 })
        .expect(404);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Fluxo ponta-a-ponta integrado (chain sem estado compartilhado com mocks)
  // ---------------------------------------------------------------------------
  describe('Fluxo ponta-a-ponta simulado: compromisso → task → confirmação', () => {
    it('compromisso válido + automação + confirmação formam cadeia auditável única', async () => {
      // Etapa 1: usecase de criação publica outbox
      const client = {
        id: 'client-1',
        firstName: 'João',
        lastName: 'Silva',
        endereco: 'Rua A',
        cidade: 'Aracati',
        uf: 'CE',
        empresaId: 'emp-1',
      };
      const appointmentRepo = {
        findMany: jest.fn(),
        findById: jest.fn(),
        create: jest.fn().mockResolvedValue({
          id: 'app-1',
          tipo: 'VISITA',
          titulo: 'Visita',
          data: new Date(Date.now() + 86400000),
          horario: '10:00',
          endereco: 'Rua A',
          observacoes: null,
          clienteId: 'client-1',
          empresaId: 'emp-1',
          ownerId: 'u-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        update: jest.fn(),
        delete: jest.fn(),
        countByDay: jest.fn(),
      };
      const clientRepo = { findById: jest.fn().mockResolvedValue(client) };
      const outbox = { publish: jest.fn().mockResolvedValue(undefined) };
      const automRepo = {
        findMany: jest.fn(),
        findById: jest.fn(),
        findActiveByEvent: jest.fn(),
        findActiveByTrigger: jest
          .fn()
          .mockResolvedValue([{ projetoId: 'proj-1', id: 'auto-1' }]),
        create: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
      };

      const createAppointment = new CreateAppointmentUseCase(
        appointmentRepo,
        clientRepo as never,
        outbox as never,
        automRepo as never,
      );

      const created = await createAppointment.execute({
        tipo: 'VISITA',
        titulo: 'Visita',
        data: new Date(Date.now() + 86400000),
        horario: '10:00',
        endereco: 'Rua A',
        observacoes: null,
        clienteId: 'client-1',
        empresaId: null,
        ownerId: 'u-1',
      });

      expect(created.clienteId).toBe('client-1');
      expect(outbox.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'APPOINTMENT_CREATED' }),
      );

      // Etapa 2: worker processa evento e cria task idempotente
      const prismaTaskMock = {
        task: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 't-comp-1' }),
          update: jest.fn(),
        },
      };
      const actionService = new TaskAutomationActionService(prismaTaskMock);
      const publishedEvent = outbox.publish.mock.calls[0][0] as {
        id: string;
        type: string;
        projetoId: string;
        aggregateId: string;
        payload: Record<string, unknown>;
      };
      await actionService.execute(
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-agenda' },
        },
        {
          id: publishedEvent.id,
          type: publishedEvent.type as 'APPOINTMENT_CREATED',
          projetoId: publishedEvent.projetoId,
          aggregateId: publishedEvent.aggregateId,
          payload: publishedEvent.payload,
          depth: 0,
          causationChain: [],
          occurredAt: new Date(),
        },
      );
      expect(prismaTaskMock.task.create).toHaveBeenCalledWith(
        expect.anything(),
      );

      // Etapa 3: confirmação registra evidência única
      const taskRepo = {
        findMany: jest.fn(),
        findById: jest.fn().mockResolvedValue({
          id: 't-comp-1',
          projetoId: 'proj-1',
          columnId: 'col-agenda',
          titulo: 'Visita',
          descricao: 'desc',
          status: 'BACKLOG',
          tipo: 'COMPROMISSO',
          appointmentId: 'app-1',
          clienteId: 'client-1',
          confirmation: null,
          prioridade: 'MEDIA',
          progresso: 0,
          tags: ['COMPROMISSO'],
          prazo: null,
          estimativaH: null,
          assigneeId: 'u-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        findByAppointmentId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        confirmActivity: jest.fn().mockResolvedValue({
          id: 'conf-1',
          taskId: 't-comp-1',
          confirmedById: 'u-1',
          confirmedAt: new Date(),
          latitude: -3.73,
          longitude: -38.52,
          accuracyMeters: 12,
          createdAt: new Date(),
        }),
        findConfirmationByTaskId: jest.fn().mockResolvedValue(null),
        syncParentProgress: jest.fn(),
      };
      const confirmUseCase = new ConfirmTaskActivityUseCase(taskRepo);
      const confirmation = await confirmUseCase.execute(
        't-comp-1',
        { latitude: -3.73, longitude: -38.52, accuracyMeters: 12 },
        { id: 'u-1', role: 'USER' },
      );
      expect(confirmation.confirmedById).toBe('u-1');
      expect(confirmation.latitude).toBe(-3.73);

      // Etapa 4: segunda confirmação falha com 409 (idempotência de evidência)
      taskRepo.findConfirmationByTaskId = jest
        .fn()
        .mockResolvedValue(confirmation);
      taskRepo.findById = jest.fn().mockResolvedValue({
        id: 't-comp-1',
        projetoId: 'proj-1',
        columnId: 'col-agenda',
        titulo: 'Visita',
        status: 'BACKLOG',
        tipo: 'COMPROMISSO',
        appointmentId: 'app-1',
        clienteId: 'client-1',
        confirmation,
        prioridade: 'MEDIA',
        progresso: 0,
        tags: ['COMPROMISSO'],
        prazo: null,
        estimativaH: null,
        assigneeId: 'u-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const secondConfirm = new ConfirmTaskActivityUseCase(taskRepo);
      await expect(
        secondConfirm.execute(
          't-comp-1',
          { latitude: -3.73, longitude: -38.52, accuracyMeters: 12 },
          { id: 'u-1', role: 'USER' },
        ),
      ).rejects.toThrow('Esta atividade já foi confirmada');
    });
  });
});
