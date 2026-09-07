import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
import { BcryptPasswordHasher } from './../src/modules/auth/infra/bcrypt-password-hasher';

// E2E do POST /auth/register com módulo dedicado (sem Prisma/DB):
// - hasher bcrypt REAL (cost reduzido 4 para velocidade no banco de
//   teste) para comprovar fluxo de hashing de ponta a ponta;
// - lookup/writer mockados por objeto (ajustáveis por teste).
// O `ValidationPipe` global replica o `main.ts` (whitelist+transform).
// Casos: 201 feliz (com hash real + sem passwordHash na resposta),
// 409 duplicado, 400 DTO inválido.
describe('POST /api/v1/auth/register (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;
  let findByEmail: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    findByEmail = jest.fn();
    create = jest.fn();
    const module = await makeModule(findByEmail, create);
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());
  });

  function makeModule(
    findByEmailMock: jest.Mock,
    createMock: jest.Mock,
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LoginUseCase,
        RegisterUseCase,
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
        { provide: AUTH_USER_WRITER_PORT, useValue: { create: createMock } },
        { provide: HASH_COMPARE_PORT, useValue: { compare: jest.fn() } },
        {
          provide: PASSWORD_HASHER_PORT,
          useValue: new BcryptPasswordHasher(4),
        },
        { provide: JWT_TOKEN_ISSUER_PORT, useValue: { sign: jest.fn() } },
      ],
    }).compile();
  }

  afterEach(async () => {
    await app.close();
  });

  it('retorna 201 com a conta criada (hash bcrypt real, sem passwordHash)', async () => {
    findByEmail.mockResolvedValue(null);
    create.mockResolvedValue({
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-4-e2e',
      role: 'USER',
      active: true,
    });

    const res = await http
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Maria',
        lastName: 'Lima',
        email: 'maria@lavifort.com.br',
        password: 'Lavifort@123',
      })
      .expect(201);

    // o hasher real gerou o hash que o writer recebeu
    const calls = create.mock.calls as Array<
      [
        {
          email: string;
          passwordHash: string;
          firstName: string;
          lastName: string;
          role: string;
          active: boolean;
        },
      ]
    >;
    const createCall = calls[0]?.[0];
    expect(createCall).toBeDefined();
    expect(createCall).toMatchObject({
      firstName: 'Maria',
      lastName: 'Lima',
      email: 'maria@lavifort.com.br',
      role: 'USER',
      active: true,
    });
    expect(createCall?.passwordHash.startsWith('$2b$')).toBe(true);

    const body = res.body as {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
    expect(body).toEqual({
      id: 'u-new',
      firstName: 'Maria',
      lastName: 'Lima',
      email: 'maria@lavifort.com.br',
      role: 'USER',
    });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('retorna 409 quando o e-mail já está cadastrado', async () => {
    findByEmail.mockResolvedValue({
      id: 'u-1',
      email: 'maria@lavifort.com.br',
      passwordHash: 'hash-antigo',
      role: 'USER',
      active: true,
    });

    await http
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Maria',
        lastName: 'Lima',
        email: 'maria@lavifort.com.br',
        password: 'Lavifort@123',
      })
      .expect(409);
  });

  it('retorna 400 com body inválido (DTO + ValidationPipe global)', async () => {
    await http
      .post('/api/v1/auth/register')
      .send({
        firstName: '',
        lastName: '',
        email: 'nao-e-email',
        password: '123',
      })
      .expect(400);
  });
});
