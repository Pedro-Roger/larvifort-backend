import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { MetricsController } from './metrics.controller';
import { MetricsUseCases } from '../application/metrics.usecases';
import { METRICS_REPOSITORY } from '../application/metrics.repository';
import type { MetricGoal } from '../domain/metrics';
const teamId = '9b283544-beb4-437e-b193-0b590c25c901',
  userId = '9b283544-beb4-437e-b193-0b590c25c902';
const input = {
  name: 'Vendas',
  teamId,
  userIds: [userId],
  type: 'SALES',
  period: 'MONTHLY',
  target: 100,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};
describe('Metrics HTTP', () => {
  let app: INestApplication<App>;
  const goals: MetricGoal[] = [];
  const token = jwt.sign(
    { sub: userId, email: 'test@example.com', role: 'ADMIN' },
    process.env.JWT_SECRET ?? 'lavifort-dev-secret',
  );
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        MetricsUseCases,
        {
          provide: METRICS_REPOSITORY,
          useValue: {
            teams: () =>
              Promise.resolve([
                {
                  id: teamId,
                  name: 'Comercial',
                  members: [{ id: userId, name: 'Ana' }],
                },
              ]),
            goals: () => Promise.resolve(goals),
            create: (value: MetricGoal) => {
              const goal = { ...value, id: 'goal-1' };
              goals.push(goal);
              return Promise.resolve(goal);
            },
            events: () => Promise.resolve([]),
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
  });
  afterAll(async () => {
    await app.close();
  });
  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/metrics/options')
      .expect(401);
  });
  it('lists teams, creates a goal and reloads it', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/metrics/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/v1/metrics/goals')
      .set('Authorization', `Bearer ${token}`)
      .send(input)
      .expect(201);
    const res = await request(app.getHttpServer())
      .get('/api/v1/metrics/goals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual([expect.objectContaining({ name: 'Vendas' })]);
  });
  it('rejects invalid inputs', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/metrics/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...input, target: -1 })
      .expect(400);
  });
  it('rejects inaccessible team', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/metrics/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...input, teamId: '9b283544-beb4-437e-b193-0b590c25c903' })
      .expect(404);
  });
  it('accepts CSV users and produces real empty analytics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/metrics/analysis')
      .query({ ...input, userIds: userId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toMatchObject({ summary: { value: 0, quantity: 0 } });
  });
});
