import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { AppointmentsController } from './../src/modules/appointments/presentation/appointments.controller';
import { ListAppointmentsUseCase } from './../src/modules/appointments/application/list-appointments.usecase';
import { GetAppointmentByIdUseCase } from './../src/modules/appointments/application/get-appointment-by-id.usecase';
import { CreateAppointmentUseCase } from './../src/modules/appointments/application/create-appointment.usecase';
import { UpdateAppointmentUseCase } from './../src/modules/appointments/application/update-appointment.usecase';
import { DeleteAppointmentUseCase } from './../src/modules/appointments/application/delete-appointment.usecase';
import { GetCalendarUseCase } from './../src/modules/appointments/application/get-calendar.usecase';
import { APPOINTMENT_REPOSITORY_PORT } from './../src/modules/appointments/application/ports/appointment-repository.port';
import jwt from 'jsonwebtoken';
import type { Appointment } from './../src/modules/appointments/domain/appointment';

describe('Appointments Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;
  let countByDayMock: jest.Mock;

  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'VISITA',
    titulo: 'Visita ao cliente',
    data: new Date('2026-10-01T10:00:00'),
    horario: '10:00',
    endereco: 'Rua Exemplo, 123',
    observacoes: null,
    clienteId: 'c-1',
    empresaId: null,
    ownerId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findManyMock = jest.fn().mockResolvedValue({ data: [SAMPLE], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE);
    createMock = jest.fn().mockResolvedValue(SAMPLE);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE, titulo: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);
    countByDayMock = jest.fn().mockResolvedValue([
      { date: '2026-10-01', count: 3 },
      { date: '2026-10-05', count: 1 },
    ]);

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
          provide: APPOINTMENT_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
            countByDay: countByDayMock,
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

  function makeToken(role = 'USER', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/appointments', () => {
    it('retorna lista paginada de compromissos', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/appointments?page=1&limit=10&tipo=VISITA')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as {
        data: Appointment[];
        meta: Record<string, unknown>;
      };
      expect(body.data).toHaveLength(1);
      expect(body.meta.total).toBe(1);
    });

    it('funciona via rota alias /api/v1/compromissos', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/compromissos?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as { data: Appointment[] };
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/appointments').expect(401);
    });
  });

  describe('GET /api/v1/appointments/calendario', () => {
    it('retorna contagem por dia', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/appointments/calendario?mes=2026-10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Array<{ date: string; count: number }>;
      expect(body).toHaveLength(2);
      expect(body[0].date).toBe('2026-10-01');
    });

    it('retorna 400 com formato de mês inválido', async () => {
      const token = makeToken();
      await http
        .get('/api/v1/appointments/calendario?mes=invalido')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/appointments/:id', () => {
    it('retorna compromisso por id', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/appointments/a-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Appointment;
      expect(body.id).toBe('a-1');
    });

    it('retorna 404 quando não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();
      await http
        .get('/api/v1/appointments/a-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/appointments', () => {
    it('retorna 201 e cria compromisso', async () => {
      const token = makeToken();
      const res = await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'VISITA',
          titulo: 'Visita ao cliente',
          data: '2026-10-01T10:00:00.000Z',
          clienteId: 'c-1',
          endereco: 'Rua Exemplo, 123',
        })
        .expect(201);

      const body = res.body as Appointment;
      expect(body.id).toBe('a-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 400 quando sem clienteId e empresaId', async () => {
      const token = makeToken();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'REUNIAO',
          titulo: 'Reunião',
          data: '2026-10-01T10:00:00.000Z',
        })
        .expect(400);
    });

    it('retorna 400 quando VISITA sem endereço', async () => {
      const token = makeToken();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'VISITA',
          titulo: 'Visita',
          data: '2026-10-01T10:00:00.000Z',
          clienteId: 'c-1',
        })
        .expect(400);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();
      await http
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/appointments/:id', () => {
    it('retorna 200 e atualiza campos', async () => {
      const token = makeToken();
      const res = await http
        .patch('/api/v1/appointments/a-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Atualizado' })
        .expect(200);

      const body = res.body as Appointment;
      expect(body.titulo).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();
      await http
        .patch('/api/v1/appointments/a-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/appointments/:id', () => {
    it('retorna 204 e deleta compromisso', async () => {
      const token = makeToken();
      await http
        .delete('/api/v1/appointments/a-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('a-1');
    });
  });
});
