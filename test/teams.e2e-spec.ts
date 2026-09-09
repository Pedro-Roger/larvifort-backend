import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { TeamsController } from './../src/modules/teams/presentation/teams.controller';
import {
  ListTeamsUseCase,
  GetTeamByIdUseCase,
  CreateTeamUseCase,
  UpdateTeamUseCase,
  DeleteTeamUseCase,
} from './../src/modules/teams/application/teams.usecases';
import { TEAM_REPOSITORY_PORT } from './../src/modules/teams/application/ports/team-repository.port';
import type { Team } from './../src/modules/teams/domain/team';

describe('Teams Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  const SAMPLE_TEAM: Team = {
    id: 't-1',
    name: 'Comercial',
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    findManyMock = jest.fn().mockResolvedValue([SAMPLE_TEAM]);
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_TEAM);
    createMock = jest.fn().mockResolvedValue(SAMPLE_TEAM);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_TEAM, name: 'Técnico' });
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        ListTeamsUseCase,
        GetTeamByIdUseCase,
        CreateTeamUseCase,
        UpdateTeamUseCase,
        DeleteTeamUseCase,
        {
          provide: TEAM_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
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

  function makeToken(role = 'ADMIN', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'admin@larvifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/teams', () => {
    it('retorna lista de times para requisição autenticada', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Team[];
      expect(body).toHaveLength(1);
      expect(body[0]?.name).toBe('Comercial');
    });

    it('retorna 401 sem autenticação', async () => {
      await http.get('/api/v1/teams').expect(401);
    });
  });

  describe('GET /api/v1/teams/:id', () => {
    it('retorna time por id', async () => {
      const token = makeToken();
      const res = await http
        .get('/api/v1/teams/t-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Team;
      expect(body.id).toBe('t-1');
      expect(body.name).toBe('Comercial');
    });
  });

  describe('POST /api/v1/teams', () => {
    it('cria novo time', async () => {
      const token = makeToken();
      const res = await http
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Comercial' })
        .expect(201);

      const body = res.body as Team;
      expect(body.name).toBe('Comercial');
      expect(createMock).toHaveBeenCalledWith('Comercial');
    });
  });

  describe('PATCH /api/v1/teams/:id', () => {
    it('atualiza time existente', async () => {
      const token = makeToken();
      const res = await http
        .patch('/api/v1/teams/t-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Técnico' })
        .expect(200);

      const body = res.body as Team;
      expect(body.name).toBe('Técnico');
      expect(updateMock).toHaveBeenCalledWith('t-1', 'Técnico');
    });
  });

  describe('DELETE /api/v1/teams/:id', () => {
    it('deleta time', async () => {
      const token = makeToken();
      await http
        .delete('/api/v1/teams/t-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('t-1');
    });
  });
});
