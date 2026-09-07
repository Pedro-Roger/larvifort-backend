import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { UsersController } from './../src/modules/users/presentation/users.controller';
import { ListUsersUseCase } from './../src/modules/users/application/list-users.usecase';
import { GetUserByIdUseCase } from './../src/modules/users/application/get-user-by-id.usecase';
import { CreateUserUseCase } from './../src/modules/users/application/create-user.usecase';
import { UpdateUserUseCase } from './../src/modules/users/application/update-user.usecase';
import { DeleteUserUseCase } from './../src/modules/users/application/delete-user.usecase';
import { UpdateMeUseCase } from './../src/modules/users/application/update-me.usecase';
import { USER_REPOSITORY_PORT } from './../src/modules/users/application/ports/user-repository.port';
import { PASSWORD_HASHER_PORT } from './../src/modules/auth/application/ports/password-hasher.port';
import { RolesGuard } from './../src/core/auth/roles.guard';
import jwt from 'jsonwebtoken';
import type { User } from './../src/modules/users/domain/user';
import type { Paginated } from './../src/core/common/pagination';

describe('Users Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByEmailMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;
  let hashMock: jest.Mock;

  const SAMPLE_USER: User = {
    id: 'u-1',
    firstName: 'Fernando',
    lastName: 'Silva',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN',
    active: true,
    teamId: 't-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_USER], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_USER);
    findByEmailMock = jest.fn().mockResolvedValue(null);
    createMock = jest.fn().mockResolvedValue(SAMPLE_USER);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_USER, firstName: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);
    hashMock = jest.fn().mockResolvedValue('hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        ListUsersUseCase,
        GetUserByIdUseCase,
        CreateUserUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        UpdateMeUseCase,
        RolesGuard,
        Reflector,
        {
          provide: USER_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            findByEmail: findByEmailMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
        {
          provide: PASSWORD_HASHER_PORT,
          useValue: { hash: hashMock },
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
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/users', () => {
    it('retorna lista paginada de usuários para requisição autenticada', async () => {
      const token = makeToken('USER');

      const res = await http
        .get('/api/v1/users?page=1&limit=10&search=fernando')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<User>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(body.data[0]).not.toHaveProperty('passwordHash');
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/users').expect(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('retorna o próprio usuário autenticado', async () => {
      const token = makeToken('USER', 'u-1');

      const res = await http
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as User;
      expect(body.id).toBe('u-1');
      expect(body.email).toBe('fernando@lavifort.com.br');
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/users/me').expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('retorna 200 e atualiza firstName do próprio usuário', async () => {
      const token = makeToken('USER', 'u-1');

      const res = await http
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Maria' })
        .expect(200);

      const body = res.body as User;
      expect(body.firstName).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.patch('/api/v1/users/me').send({ firstName: 'X' }).expect(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('retorna usuário pelo id', async () => {
      const token = makeToken('USER');

      const res = await http
        .get('/api/v1/users/u-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as User;
      expect(body.id).toBe('u-1');
      expect(body.email).toBe('fernando@lavifort.com.br');
    });

    it('retorna 404 quando o usuário não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken('USER');

      await http
        .get('/api/v1/users/u-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/users', () => {
    it('retorna 201 e cria usuário quando chamado por ADMIN', async () => {
      const token = makeToken('ADMIN');

      const res = await http
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Fernando',
          lastName: 'Silva',
          email: 'fernando@lavifort.com.br',
          password: 'Lavifort@123',
          role: 'ADMIN',
        })
        .expect(201);

      const body = res.body as User;
      expect(body.id).toBe('u-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 403 Forbidden quando chamado por role USER', async () => {
      const token = makeToken('USER');

      await http
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Fernando',
          lastName: 'Silva',
          email: 'fernando@lavifort.com.br',
          password: 'Lavifort@123',
        })
        .expect(403);

      expect(createMock).not.toHaveBeenCalled();
    });

    it('retorna 409 Conflict quando email já existe', async () => {
      findByEmailMock.mockResolvedValue(SAMPLE_USER);
      const token = makeToken('ADMIN');

      await http
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Fernando',
          lastName: 'Silva',
          email: 'fernando@lavifort.com.br',
          password: 'Lavifort@123',
        })
        .expect(409);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken('ADMIN');

      await http
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: '', email: 'invalido', password: '123' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('retorna 200 e atualiza campos do usuário', async () => {
      const token = makeToken('ADMIN');

      const res = await http
        .patch('/api/v1/users/u-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Atualizado' })
        .expect(200);

      const body = res.body as User;
      expect(body.firstName).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando usuário não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken('ADMIN');

      await http
        .patch('/api/v1/users/u-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('retorna 204 e deleta usuário quando chamado por ADMIN', async () => {
      const token = makeToken('ADMIN');

      await http
        .delete('/api/v1/users/u-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('u-1');
    });

    it('retorna 403 Forbidden quando chamado por role USER', async () => {
      const token = makeToken('USER');

      await http
        .delete('/api/v1/users/u-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(deleteMock).not.toHaveBeenCalled();
    });
  });
});
