import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { BoardColumnsController } from '../src/modules/tasks/presentation/board-columns.controller';
import {
  NotificationPreferencesDto,
  NotificationsController,
} from '../src/modules/notifications/presentation/notifications.controller';
import { ListProjectColumnsUseCase } from '../src/modules/tasks/application/list-project-columns.usecase';
import { CreateProjectColumnUseCase } from '../src/modules/tasks/application/create-project-column.usecase';
import { UpdateProjectColumnUseCase } from '../src/modules/tasks/application/update-project-column.usecase';
import { DeleteProjectColumnUseCase } from '../src/modules/tasks/application/delete-project-column.usecase';
import { ReorderProjectColumnsUseCase } from '../src/modules/tasks/application/reorder-project-columns.usecase';
import type { ProjectColumn } from '../src/modules/tasks/domain/task';

describe('Board Columns and Notifications (E2E)', () => {
  let app: INestApplication;
  let http: SuperTestHttp;
  let token: string;

  const mockListCols = jest.fn();
  const mockCreateCol = jest.fn();
  const mockUpdateCol = jest.fn();
  const mockDeleteCol = jest.fn();
  const mockReorderCols = jest.fn();

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      'test-secret',
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BoardColumnsController, NotificationsController],
      providers: [
        {
          provide: ListProjectColumnsUseCase,
          useValue: { execute: mockListCols },
        },
        {
          provide: CreateProjectColumnUseCase,
          useValue: { execute: mockCreateCol },
        },
        {
          provide: UpdateProjectColumnUseCase,
          useValue: { execute: mockUpdateCol },
        },
        {
          provide: DeleteProjectColumnUseCase,
          useValue: { execute: mockDeleteCol },
        },
        {
          provide: ReorderProjectColumnsUseCase,
          useValue: { execute: mockReorderCols },
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

  describe('Board Columns Routes', () => {
    it('GET /api/v1/tasks/boards/:boardId/columns retorna colunas', async () => {
      mockListCols.mockResolvedValue([
        { id: 'c-1', projetoId: 'b-1', title: 'Backlog', order: 0 },
      ]);

      const res = await http
        .get('/api/v1/tasks/boards/b-1/columns')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as ProjectColumn[];
      expect(body).toHaveLength(1);
      expect(mockListCols).toHaveBeenCalledWith('b-1');
    });

    it('POST /api/v1/tasks/boards/:boardId/columns cria coluna', async () => {
      mockCreateCol.mockResolvedValue({
        id: 'c-2',
        projetoId: 'b-1',
        title: 'Em Progresso',
        order: 1,
      });

      const res = await http
        .post('/api/v1/tasks/boards/b-1/columns')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Em Progresso', order: 1 })
        .expect(201);

      const body = res.body as ProjectColumn;
      expect(body.title).toBe('Em Progresso');
    });

    it('PATCH /api/v1/tasks/columns/:columnId atualiza coluna', async () => {
      mockUpdateCol.mockResolvedValue({
        id: 'c-1',
        title: 'Novo Backlog',
      });

      const res = await http
        .patch('/api/v1/tasks/columns/c-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Novo Backlog' })
        .expect(200);

      const body = res.body as ProjectColumn;
      expect(body.title).toBe('Novo Backlog');
    });

    it('DELETE /api/v1/tasks/columns/:columnId exclui coluna (204)', async () => {
      mockDeleteCol.mockResolvedValue(undefined);

      await http
        .delete('/api/v1/tasks/columns/c-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(mockDeleteCol).toHaveBeenCalledWith('c-1');
    });
  });

  describe('Notifications Routes', () => {
    it('GET /api/v1/notifications retorna lista de notificações', async () => {
      const res = await http
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/notifications/preferences retorna preferências', async () => {
      const res = await http
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as NotificationPreferencesDto;
      expect(body.emailNotifications).toBe(true);
    });
  });
});
