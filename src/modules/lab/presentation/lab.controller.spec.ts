import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { LabController } from './lab.controller';
import { GenerateLabWorkOrderUseCase } from '../application/generate-lab-work-order.usecase';
import { UpdateLabWorkOrderStatusUseCase } from '../application/update-lab-work-order-status.usecase';
import { ListLabOrdersUseCase } from '../application/list-lab-orders.usecase';
import { GetLabWorkOrderUseCase } from '../application/get-lab-work-order.usecase';
import type { LabWorkOrder } from '../domain/lab-work-order';

type SuperTestHttp = ReturnType<typeof request>;

describe('Lab Controller (unit)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  const SAMPLE_WO: LabWorkOrder = {
    id: 'wo-1',
    orderId: 'order-1',
    orderNumber: 'ORD-2026-0001',
    clientName: 'João Silva',
    productId: 'p-1',
    productName: 'Pós-larva',
    quantity: 10,
    unit: 'MILHEIRO',
    stockUnitId: null,
    stockUnitName: null,
    stockLocationId: null,
    stockLocationName: null,
    deliveryDate: new Date('2026-09-25'),
    status: 'AGUARDANDO_LABORATORIO',
    statusChangedBy: null,
    statusChangedAt: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let generateMock: jest.Mock;
  let updateStatusMock: jest.Mock;
  let listMock: jest.Mock;
  let getMock: jest.Mock;

  function makeToken(): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: 'u-1', email: 'user@lavifort.com.br', role: 'USER' },
      secret,
      { expiresIn: '15m' },
    );
  }

  beforeEach(async () => {
    generateMock = jest.fn().mockResolvedValue([SAMPLE_WO]);
    updateStatusMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_WO, status: 'RECEBIDO' });
    listMock = jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } });
    getMock = jest.fn().mockResolvedValue(SAMPLE_WO);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabController],
      providers: [
        {
          provide: GenerateLabWorkOrderUseCase,
          useValue: { execute: generateMock },
        },
        {
          provide: UpdateLabWorkOrderStatusUseCase,
          useValue: { execute: updateStatusMock },
        },
        { provide: ListLabOrdersUseCase, useValue: { execute: listMock } },
        { provide: GetLabWorkOrderUseCase, useValue: { execute: getMock } },
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

  it('GET /api/v1/lab/orders lista pedidos fechados (200)', async () => {
    const res = await http
      .get('/api/v1/lab/orders?page=1&limit=10')
      .set('Authorization', `Bearer ${makeToken()}`)
      .expect(200);
    expect((res.body as { meta: { total: number } }).meta.total).toBe(0);
    expect(listMock).toHaveBeenCalled();
  });

  it('POST /api/v1/orders/:id/lab-work-order cria OS (201)', async () => {
    const res = await http
      .post('/api/v1/orders/order-1/lab-work-order')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ stockUnitName: 'Morada Nova' })
      .expect(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(generateMock).toHaveBeenCalledWith(
      'order-1',
      'u-1',
      expect.anything(),
    );
  });

  it('PATCH /api/v1/lab/work-orders/:id/status atualiza (200)', async () => {
    const res = await http
      .patch('/api/v1/lab/work-orders/wo-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'RECEBIDO' })
      .expect(200);
    expect((res.body as { status: string }).status).toBe('RECEBIDO');
    expect(updateStatusMock).toHaveBeenCalledWith('wo-1', 'RECEBIDO', 'u-1');
  });

  it('PATCH .../status retorna 400 para estado inválido', async () => {
    await http
      .patch('/api/v1/lab/work-orders/wo-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'INVALIDO' })
      .expect(400);
  });

  it('GET /api/v1/lab/work-orders/:id retorna OS (200)', async () => {
    const res = await http
      .get('/api/v1/lab/work-orders/wo-1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .expect(200);
    expect((res.body as { id: string }).id).toBe('wo-1');
  });

  it('retorna 401 sem token', async () => {
    await http.get('/api/v1/lab/orders').expect(401);
    await http.post('/api/v1/orders/order-1/lab-work-order').expect(401);
    await http
      .patch('/api/v1/lab/work-orders/wo-1/status')
      .send({ status: 'RECEBIDO' })
      .expect(401);
    await http.get('/api/v1/lab/work-orders/wo-1').expect(401);
  });
});
