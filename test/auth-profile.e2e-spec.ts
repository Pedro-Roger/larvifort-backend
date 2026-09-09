import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { AuthController } from './../src/modules/auth/presentation/auth.controller';
import { LoginUseCase } from './../src/modules/auth/application/login.usecase';
import { RegisterUseCase } from './../src/modules/auth/application/register.usecase';
import { GetProfileUseCase } from './../src/modules/auth/application/get-profile.usecase';
import { LogoutUseCase } from './../src/modules/auth/application/logout.usecase';
import { AUTH_USER_LOOKUP_PORT } from './../src/modules/auth/application/ports/auth-user-lookup.port';
import { HASH_COMPARE_PORT } from './../src/modules/auth/application/ports/hash-compare.port';
import { JWT_TOKEN_ISSUER_PORT } from './../src/modules/auth/application/ports/token-issuer.port';
import { AUTH_USER_WRITER_PORT } from './../src/modules/auth/application/ports/auth-user-writer.port';
import { PASSWORD_HASHER_PORT } from './../src/modules/auth/application/ports/password-hasher.port';
import jwt from 'jsonwebtoken';

describe('GET /api/v1/auth/profile & /me (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;
  let findByEmail: jest.Mock;

  const SECRET = process.env.JWT_SECRET ?? 'lavifort-dev-secret';

  beforeEach(async () => {
    findByEmail = jest.fn();
    const module = await makeModule(findByEmail);
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    http = request(app.getHttpServer());
  });

  function makeModule(findByEmailMock: jest.Mock): Promise<TestingModule> {
    return Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        GetProfileUseCase,
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
        { provide: RegisterUseCase, useValue: { execute: jest.fn() } },
        {
          provide: AUTH_USER_LOOKUP_PORT,
          useValue: {
            findByEmail: findByEmailMock,
          },
        },
        { provide: AUTH_USER_WRITER_PORT, useValue: { create: jest.fn() } },
        { provide: HASH_COMPARE_PORT, useValue: { compare: jest.fn() } },
        { provide: PASSWORD_HASHER_PORT, useValue: { hash: jest.fn() } },
        { provide: JWT_TOKEN_ISSUER_PORT, useValue: { sign: jest.fn() } },
      ],
    }).compile();
  }

  afterEach(async () => {
    await app.close();
  });

  function makeValidToken(userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      secret,
      { expiresIn: '15m' },
    );
  }

  it('retorna 200 com perfil do usuário para GET /auth/profile', async () => {
    const token = makeValidToken();

    const res = await http
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: 'u-1',
      email: 'user@lavifort.com.br',
      role: 'USER',
    });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('retorna 200 com perfil do usuário para GET /auth/me', async () => {
    const token = makeValidToken();

    const res = await http
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: 'u-1',
      email: 'user@lavifort.com.br',
      role: 'USER',
    });
  });

  it('retorna 401 sem header Authorization', async () => {
    await http.get('/api/v1/auth/profile').expect(401);
  });

  it('retorna 401 com token assinado com outro secret', async () => {
    const wrongToken = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      'wrong-secret',
    );

    await http
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(401);
  });

  it('retorna 401 com token expirado', async () => {
    const expiredToken = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      SECRET,
      { expiresIn: '-1s' },
    );

    await http
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
