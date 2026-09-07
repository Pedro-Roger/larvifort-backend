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
import { REFRESH_TOKEN_PORT } from './../src/modules/auth/application/ports/refresh-token.port';
import jwt from 'jsonwebtoken';

// E2E do POST /auth/logout com JwtAuthGuard real:
// Valida que apenas requisições autenticadas por Bearer JWT podem executar
// logout (revogando tokens do usuário) e devolve 200 com mensagem.
describe('POST /api/v1/auth/logout (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;
  let revokeByUserId: jest.Mock;

  const SECRET = process.env.JWT_SECRET ?? 'lavifort-dev-secret';

  beforeEach(async () => {
    revokeByUserId = jest.fn().mockResolvedValue(undefined);
    const module = await makeModule(revokeByUserId);
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    http = request(app.getHttpServer());
  });

  function makeModule(revokeMock: jest.Mock): Promise<TestingModule> {
    return Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LogoutUseCase,
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
        { provide: RegisterUseCase, useValue: { execute: jest.fn() } },
        { provide: GetProfileUseCase, useValue: { execute: jest.fn() } },
        {
          provide: REFRESH_TOKEN_PORT,
          useValue: {
            revokeByUserId: revokeMock,
            revokeByTokenHash: jest.fn(),
            create: jest.fn(),
            findByTokenHash: jest.fn(),
          },
        },
        {
          provide: AUTH_USER_LOOKUP_PORT,
          useValue: { findById: jest.fn(), findByEmail: jest.fn() },
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

  it('retorna 200 e revoga tokens do usuário ao chamar POST /auth/logout com token válido', async () => {
    const token = makeValidToken('u-1');

    const res = await http
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(revokeByUserId).toHaveBeenCalledWith('u-1');
    expect(res.body).toEqual({ message: 'Logout realizado com sucesso.' });
  });

  it('retorna 401 sem header Authorization', async () => {
    await http.post('/api/v1/auth/logout').expect(401);
    expect(revokeByUserId).not.toHaveBeenCalled();
  });

  it('retorna 401 com token assinado por secret inválido', async () => {
    const wrongToken = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      'wrong-secret',
    );

    await http
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(401);

    expect(revokeByUserId).not.toHaveBeenCalled();
  });

  it('retorna 401 com token expirado', async () => {
    const expiredToken = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      SECRET,
      { expiresIn: '-1s' },
    );

    await http
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(revokeByUserId).not.toHaveBeenCalled();
  });
});
