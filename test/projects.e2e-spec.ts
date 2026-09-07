import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { ProjectsController } from './../src/modules/tasks/presentation/projects.controller';
import { ListProjectsUseCase } from './../src/modules/tasks/application/list-projects.usecase';
import { GetProjectByIdUseCase } from './../src/modules/tasks/application/get-project-by-id.usecase';
import { CreateProjectUseCase } from './../src/modules/tasks/application/create-project.usecase';
import { UpdateProjectUseCase } from './../src/modules/tasks/application/update-project.usecase';
import { DeleteProjectUseCase } from './../src/modules/tasks/application/delete-project.usecase';
import { PROJECT_REPOSITORY_PORT } from './../src/modules/tasks/application/ports/project-repository.port';
import jwt from 'jsonwebtoken';
import type { Project } from './../src/modules/tasks/domain/task';

describe('Projects Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findAllMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByNameMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findAllMock = jest.fn().mockResolvedValue([SAMPLE_PROJECT]);
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    findByNameMock = jest.fn().mockResolvedValue(null);
    createMock = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_PROJECT, name: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ListProjectsUseCase,
        GetProjectByIdUseCase,
        CreateProjectUseCase,
        UpdateProjectUseCase,
        DeleteProjectUseCase,
        {
          provide: PROJECT_REPOSITORY_PORT,
          useValue: {
            findAll: findAllMock,
            findById: findByIdMock,
            findByName: findByNameMock,
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

  function makeToken(role = 'USER', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/projects', () => {
    it('retorna lista de projetos para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Project[];
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('LarviFort CRM');
    });

    it('funciona via rota alias /api/v1/projetos', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/projetos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Project[];
      expect(body).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/projects').expect(401);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('retorna projeto por id', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/projects/p-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Project;
      expect(body.id).toBe('p-1');
      expect(body.name).toBe('LarviFort CRM');
    });

    it('retorna 404 quando projeto não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/projects/p-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('retorna 201 e cria projeto com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'LarviFort CRM' })
        .expect(201);

      const body = res.body as Project;
      expect(body.id).toBe('p-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 409 Conflict quando nome de projeto já existe', async () => {
      findByNameMock.mockResolvedValue(SAMPLE_PROJECT);
      const token = makeToken();

      await http
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'LarviFort CRM' })
        .expect(409);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/projects/:id', () => {
    it('retorna 200 e atualiza campos do projeto', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/projects/p-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(200);

      const body = res.body as Project;
      expect(body.name).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando projeto não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/projects/p-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('retorna 204 e deleta projeto', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/projects/p-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('p-1');
    });
  });
});
