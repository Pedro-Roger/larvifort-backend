import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { TasksController } from './../src/modules/tasks/presentation/tasks.controller';
import { ListTasksUseCase } from './../src/modules/tasks/application/list-tasks.usecase';
import { GetTaskByIdUseCase } from './../src/modules/tasks/application/get-task-by-id.usecase';
import { CreateTaskUseCase } from './../src/modules/tasks/application/create-task.usecase';
import { UpdateTaskUseCase } from './../src/modules/tasks/application/update-task.usecase';
import { UpdateTaskStatusUseCase } from './../src/modules/tasks/application/update-task-status.usecase';
import { DeleteTaskUseCase } from './../src/modules/tasks/application/delete-task.usecase';
import { TASK_REPOSITORY_PORT } from './../src/modules/tasks/application/ports/task-repository.port';
import { PROJECT_REPOSITORY_PORT } from './../src/modules/tasks/application/ports/project-repository.port';
import jwt from 'jsonwebtoken';
import type { Project, Task } from './../src/modules/tasks/domain/task';
import type { Paginated } from './../src/core/common/pagination';

describe('Tasks Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;
  let findProjectByIdMock: jest.Mock;

  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    titulo: 'Desenvolver API',
    descricao: 'Implementar Kanban',
    status: 'EM_ANDAMENTO',
    prioridade: 'ALTA',
    progresso: 50,
    tags: ['backend', 'nestjs'],
    prazo: new Date('2026-10-01'),
    estimativaH: 8,
    assigneeId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_TASK], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_TASK);
    createMock = jest.fn().mockResolvedValue(SAMPLE_TASK);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_TASK, titulo: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);
    findProjectByIdMock = jest.fn().mockResolvedValue(SAMPLE_PROJECT);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        ListTasksUseCase,
        GetTaskByIdUseCase,
        CreateTaskUseCase,
        UpdateTaskUseCase,
        UpdateTaskStatusUseCase,
        DeleteTaskUseCase,
        {
          provide: TASK_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
        {
          provide: PROJECT_REPOSITORY_PORT,
          useValue: {
            findById: findProjectByIdMock,
            findAll: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

  describe('GET /api/v1/tasks', () => {
    it('retorna lista paginada de tarefas para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/tasks?page=1&limit=10&search=API&status=EM_ANDAMENTO')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Task>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('funciona via rota alias /api/v1/tarefas', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/tarefas?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Task>;
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/tasks').expect(401);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('retorna tarefa por id', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/tasks/t-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Task;
      expect(body.id).toBe('t-1');
      expect(body.titulo).toBe('Desenvolver API');
    });

    it('retorna 404 quando tarefa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/tasks/t-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('retorna 201 e cria tarefa com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projetoId: 'p-1',
          titulo: 'Desenvolver API',
          status: 'EM_ANDAMENTO',
          prioridade: 'ALTA',
          progresso: 50,
        })
        .expect(201);

      const body = res.body as Task;
      expect(body.id).toBe('t-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 404 quando projeto não existe', async () => {
      findProjectByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projetoId: 'p-ghost',
          titulo: 'Desenvolver API',
        })
        .expect(404);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('retorna 200 e atualiza campos da tarefa', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/tasks/t-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Atualizado' })
        .expect(200);

      const body = res.body as Task;
      expect(body.titulo).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 200 ao atualizar status via /status e /mover', async () => {
      updateMock.mockResolvedValue({
        ...SAMPLE_TASK,
        status: 'CONCLUIDO',
        progresso: 100,
      });
      const token = makeToken();

      const res = await http
        .patch('/api/v1/tasks/t-1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONCLUIDO' })
        .expect(200);

      const body = res.body as Task;
      expect(body.status).toBe('CONCLUIDO');
    });

    it('retorna 200 ao atualizar progresso via /progresso', async () => {
      updateMock.mockResolvedValue({
        ...SAMPLE_TASK,
        progresso: 80,
      });
      const token = makeToken();

      const res = await http
        .patch('/api/v1/tasks/t-1/progresso')
        .set('Authorization', `Bearer ${token}`)
        .send({ progresso: 80 })
        .expect(200);

      const body = res.body as Task;
      expect(body.progresso).toBe(80);
    });

    it('retorna 404 quando tarefa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/tasks/t-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('retorna 204 e deleta tarefa', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/tasks/t-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('t-1');
    });
  });
});
