import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import {
  BoardTemplateResponse,
  BoardTemplatesController,
} from '../src/modules/tasks/presentation/board-templates.controller';
import { TaskTransferController } from '../src/modules/tasks/presentation/task-transfer.controller';
import { DirectAutomationsController } from '../src/modules/automations/presentation/direct-automations.controller';
import { ListProjectTemplatesUseCase } from '../src/modules/tasks/application/list-project-templates.usecase';
import { GetProjectTemplateByIdUseCase } from '../src/modules/tasks/application/get-project-template-by-id.usecase';
import { CreateTaskUseCase } from '../src/modules/tasks/application/create-task.usecase';
import { GetTaskByIdUseCase } from '../src/modules/tasks/application/get-task-by-id.usecase';
import { UpdateTaskUseCase } from '../src/modules/tasks/application/update-task.usecase';
import { ManageAutomationsUseCase } from '../src/modules/automations/application/manage-automations.usecase';
import { AutomationEngineService } from '../src/modules/automations/application/automation-engine.service';
import { PROJECT_TEMPLATES } from '../src/modules/tasks/domain/project-template';
import type { Task } from '../src/modules/tasks/domain/task';
import type { Automation } from '../src/modules/automations/domain/automation';

describe('Kanban Board Full Endpoints (E2E)', () => {
  let app: INestApplication;
  let http: SuperTestHttp;
  let token: string;

  const mockListTemplates = jest.fn();
  const mockGetTemplate = jest.fn();
  const mockCreateTask = jest.fn();
  const mockGetTask = jest.fn();
  const mockUpdateTask = jest.fn();
  const mockManage = {
    update: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
  };
  const mockEngine = {
    dryRun: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      'test-secret',
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        BoardTemplatesController,
        TaskTransferController,
        DirectAutomationsController,
      ],
      providers: [
        {
          provide: ListProjectTemplatesUseCase,
          useValue: { execute: mockListTemplates },
        },
        {
          provide: GetProjectTemplateByIdUseCase,
          useValue: { execute: mockGetTemplate },
        },
        {
          provide: CreateTaskUseCase,
          useValue: { execute: mockCreateTask },
        },
        {
          provide: GetTaskByIdUseCase,
          useValue: { execute: mockGetTask },
        },
        {
          provide: UpdateTaskUseCase,
          useValue: { execute: mockUpdateTask },
        },
        {
          provide: ManageAutomationsUseCase,
          useValue: mockManage,
        },
        {
          provide: AutomationEngineService,
          useValue: mockEngine,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer() as App);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Board Templates Routes', () => {
    it('GET /api/v1/tasks/boards/:boardId/templates retorna templates', async () => {
      mockListTemplates.mockReturnValue(PROJECT_TEMPLATES);

      const res = await http
        .get('/api/v1/tasks/boards/board-123/templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as BoardTemplateResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/tasks/boards/:boardId/templates cria template', async () => {
      const res = await http
        .post('/api/v1/tasks/boards/board-123/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Template Comercial' })
        .expect(201);

      const body = res.body as BoardTemplateResponse;
      expect(body.name).toBe('Template Comercial');
    });

    it('POST /api/v1/tasks/templates/:templateId/apply cria tarefa a partir do template', async () => {
      mockGetTemplate.mockReturnValue(PROJECT_TEMPLATES[0]);
      mockCreateTask.mockResolvedValue({
        id: 't-from-tmpl',
        titulo: 'Tarefa Aplicada',
      });

      const res = await http
        .post('/api/v1/tasks/templates/vazio/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projetoId: 'board-123', titulo: 'Tarefa Aplicada' })
        .expect(201);

      const body = res.body as Task;
      expect(body.titulo).toBe('Tarefa Aplicada');
    });
  });

  describe('Task Transfer Routes', () => {
    it('POST /api/v1/tasks/:taskId/transfer move tarefa', async () => {
      mockGetTask.mockResolvedValue({
        id: 't-1',
        titulo: 'Tarefa Original',
        projetoId: 'board-1',
      });
      mockUpdateTask.mockResolvedValue({
        id: 't-1',
        titulo: 'Tarefa Original',
        projetoId: 'board-2',
      });

      const res = await http
        .post('/api/v1/tasks/t-1/transfer')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetBoardId: 'board-2', mode: 'MOVE' })
        .expect(201);

      const body = res.body as { originalTask: Task };
      expect(body.originalTask.projetoId).toBe('board-2');
    });
  });

  describe('Direct Automations Routes', () => {
    it('PATCH /api/v1/tasks/automations/:id atualiza automação', async () => {
      mockManage.update.mockResolvedValue({
        id: 'auto-1',
        name: 'Automação Atualizada',
      });

      const res = await http
        .patch('/api/v1/tasks/automations/auto-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Automação Atualizada' })
        .expect(200);

      const body = res.body as Automation;
      expect(body.name).toBe('Automação Atualizada');
    });

    it('POST /api/v1/tasks/automations/:id/test testa automação', async () => {
      mockManage.get.mockResolvedValue({
        id: 'auto-1',
        name: 'Auto 1',
      });
      mockEngine.dryRun.mockReturnValue({
        matched: true,
        actions: [{ type: 'MOVE_TASK', params: {} }],
      });

      const res = await http
        .post('/api/v1/tasks/automations/auto-1/test')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'NOVO' })
        .expect(201);

      const body = res.body as { success: boolean };
      expect(body.success).toBe(true);
    });
  });
});
