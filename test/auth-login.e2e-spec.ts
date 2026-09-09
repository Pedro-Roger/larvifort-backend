import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
type SuperTestRequest = ReturnType<typeof request>;
import { AuthController } from './../src/modules/auth/presentation/auth.controller';
import { LoginUseCase } from './../src/modules/auth/application/login.usecase';
import { RegisterUseCase } from './../src/modules/auth/application/register.usecase';
import { GetProfileUseCase } from './../src/modules/auth/application/get-profile.usecase';
import { LogoutUseCase } from './../src/modules/auth/application/logout.usecase';
import { AUTH_USER_LOOKUP_PORT } from './../src/modules/auth/application/ports/auth-user-lookup.port';
import { HASH_COMPARE_PORT } from './../src/modules/auth/application/ports/hash-compare.port';
import { JWT_TOKEN_ISSUER_PORT } from './../src/modules/auth/application/ports/token-issuer.port';
import { PASSWORD_HASHER_PORT } from './../src/modules/auth/application/ports/password-hasher.port';
import { REFRESH_TOKEN_PORT } from './../src/modules/auth/application/ports/refresh-token.port';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// E2E do POST /auth/login com módulo dedicado (sem Prisma/DB): o emissor
// real de JWT (jsonwebtoken, CJS puro) valida assinatura/claims no happy
// path; lookup/hash são mocks por objeto (ajustáveis por teste) mantendo
// o mesmo app tipado — 200 feliz, 401 senha errada/inativa, 400 DTO.
// `ValidationPipe` global replica o `main.ts` (whitelist+transform).
describe('POST /api/v1/auth/login (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestRequest;
  let findByEmail: jest.Mock;
  let compare: jest.Mock;

  const SECRET = 'e2e-secret';
  const ACTIVE_USER = {
    id: 'u-1',
    email: 'fernando@lavifort.com.br',
    passwordHash: 'hash-bcrypt-cost-12',
    role: 'ADMIN',
    active: true,
  };

  beforeEach(async () => {
    findByEmail = jest.fn();
    compare = jest.fn();
    const module = await makeModule(findByEmail, compare);
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    const server = app.getHttpServer();
    http = request(server);
  });

  function makeModule(
    findByEmailMock: jest.Mock,
    compareMock: jest.Mock,
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LoginUseCase,
        {
          provide: RegisterUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_USER_LOOKUP_PORT,
          useValue: { findByEmail: findByEmailMock },
        },
        { provide: HASH_COMPARE_PORT, useValue: { compare: compareMock } },
        {
          provide: PASSWORD_HASHER_PORT,
          useValue: { hash: jest.fn().mockResolvedValue('hash') },
        },
        { provide: REFRESH_TOKEN_PORT, useValue: { create: jest.fn() } },
        {
          provide: JWT_TOKEN_ISSUER_PORT,
          useValue: {
            sign: (payload: { sub: string; email: string; role: string }) =>
              Promise.resolve(
                jwt.sign(payload, SECRET, {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                }),
              ),
          },
        },
      ],
    }).compile();
  }

  afterEach(async () => {
    await app.close();
  });

  it('retorna 200 com accessToken assinado e user', async () => {
    findByEmail.mockResolvedValue(ACTIVE_USER);
    compare.mockResolvedValue(true);

    const res = await http
      .post('/api/v1/auth/login')
      .send({ email: 'fernando@lavifort.com.br', password: 'Lavifort@123' })
      .expect(200);

    const body = res.body as {
      accessToken: string;
      user: { id: string; email: string; role: string };
    };
    expect(typeof body.accessToken).toBe('string');

    const decoded = jwt.verify(body.accessToken, SECRET, {
      ignoreExpiration: true,
    }) as JwtPayload & { email: string; role: string };
    expect(decoded.sub).toBe('u-1');
    expect(decoded.email).toBe('fernando@lavifort.com.br');
    expect(decoded.role).toBe('ADMIN');

    expect(body.user).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('retorna 401 com senha errada (compare falso)', async () => {
    findByEmail.mockResolvedValue(ACTIVE_USER);
    compare.mockResolvedValue(false);

    await http
      .post('/api/v1/auth/login')
      .send({ email: 'fernando@lavifort.com.br', password: 'erradapass' })
      .expect(401);
  });

  it('retorna 401 quando usuário não existe', async () => {
    findByEmail.mockResolvedValue(null);
    compare.mockResolvedValue(true);

    await http
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@lavifort.com.br', password: 'x1234567' })
      .expect(401);
  });

  it('retorna 400 com body inválido (DTO + ValidationPipe global)', async () => {
    await http
      .post('/api/v1/auth/login')
      .send({ email: 'nao-e-email', password: '' })
      .expect(400);
  });
});
