import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { SeparationController } from '../src/modules/separation/presentation/separation.controller';
import { StartSeparationUseCase } from '../src/modules/separation/application/start-separation.usecase';
import { CompleteSeparationUseCase } from '../src/modules/separation/application/complete-separation.usecase';
import { ReportSeparationDivergenceUseCase } from '../src/modules/separation/application/report-separation-divergence.usecase';

type SuperTestHttp = ReturnType<typeof request>;

describe('Separation Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  function makeToken(): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: 'u-1', email: 'user@lavifort.com.br', role: 'USER' },
      secret,
      { expiresIn: '15m' },
    );
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeparationController],
      providers: [
        {
          provide: StartSeparationUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({ status: 'EM_SEPARACAO' }),
          },
        },
        {
          provide: CompleteSeparationUseCase,
          useValue: { execute: jest.fn().mockResolvedValue({ success: true }) },
        },
        {
          provide: ReportSeparationDivergenceUseCase,
          useValue: { execute: jest.fn().mockResolvedValue({ success: true }) },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    http = request(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /orders/:id/separation/start inicia separação', async () => {
    await http
      .post('/api/v1/orders/order-1/separation/start')
      .set('Authorization', `Bearer ${makeToken()}`)
      .expect(201);
  });
});
