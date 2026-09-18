import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { LabController } from '../src/modules/lab/presentation/lab.controller';
import { GenerateLabWorkOrderUseCase } from '../src/modules/lab/application/generate-lab-work-order.usecase';
import { UpdateLabWorkOrderStatusUseCase } from '../src/modules/lab/application/update-lab-work-order-status.usecase';
import { ListLabOrdersUseCase } from '../src/modules/lab/application/list-lab-orders.usecase';
import { GetLabWorkOrderUseCase } from '../src/modules/lab/application/get-lab-work-order.usecase';
import type { LabWorkOrder } from '../src/modules/lab/domain/lab-work-order';
import type { Order } from '../src/modules/orders/domain/order';

type SuperTestHttp = ReturnType<typeof request>;

describe('Lab Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  const SAMPLE_ORDER: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    operationalStatus: 'FECHADO',
    clientId: 'client-1',
    clientName: 'João Silva',
    paymentMethod: 'PIX',
    deliveryDate: new Date('2026-09-22T10:00:00.000Z'),
    subtotal: 1000,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 1000,
    orderDate: new Date('2026-09-15'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'p-1',
        productName: 'Larva PL10',
        unit: 'MILHEIRO',
        quantity: 10,
        unitPrice: 100,
        discount: 0,
        totalPrice: 1000,
        type: 'PRODUCT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
  };

  const SAMPLE_WO: LabWorkOrder = {
    id: 'wo-1',
    orderId: 'order-1',
    orderNumber: 'ORD-2026-0001',
    clientName: 'João Silva',
    productId: 'p-1',
    productName: 'Larva PL10',
    quantity: 10,
    unit: 'MILHEIRO',
    stockUnitId: null,
    stockUnitName: null,
    stockLocationId: null,
    stockLocationName: null,
    deliveryDate: new Date('2026-09-22T10:00:00.000Z'),
    status: 'AGUARDANDO_LABORATORIO',
    statusChangedBy: null,
    statusChangedAt: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeToken(role = 'USER', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabController],
      providers: [
        {
          provide: GenerateLabWorkOrderUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([SAMPLE_WO]) },
        },
        {
          provide: UpdateLabWorkOrderStatusUseCase,
          useValue: {
            execute: jest
              .fn()
              .mockResolvedValue({ ...SAMPLE_WO, status: 'RECEBIDO' }),
          },
        },
        {
          provide: ListLabOrdersUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              data: [{ ...SAMPLE_ORDER }],
              meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
            }),
          },
        },
        {
          provide: GetLabWorkOrderUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(SAMPLE_WO) },
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

  describe('GET /api/v1/lab/orders', () => {
    it('retorna pedidos fechados para o laboratório', async () => {
      const res = await http
        .get('/api/v1/lab/orders?page=1&limit=20')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as { data: Order[]; meta: { total: number } };
      expect(body.data).toHaveLength(1);
      expect(body.meta.total).toBe(1);
    });

    it('retorna 401 sem token', async () => {
      await http.get('/api/v1/lab/orders').expect(401);
    });
  });

  describe('POST /api/v1/orders/:id/lab-work-order', () => {
    it('gera OS de laboratório (201)', async () => {
      const res = await http
        .post('/api/v1/orders/order-1/lab-work-order')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ stockUnitName: 'Morada Nova' })
        .expect(201);
      const body = res.body as LabWorkOrder[];
      expect(body).toHaveLength(1);
      expect(body[0].productName).toBe('Larva PL10');
    });

    it('retorna 401 sem token', async () => {
      await http.post('/api/v1/orders/order-1/lab-work-order').expect(401);
    });
  });

  describe('PATCH /api/v1/lab/work-orders/:id/status', () => {
    it('atualiza status e registra responsável', async () => {
      const res = await http
        .patch('/api/v1/lab/work-orders/wo-1/status')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'RECEBIDO' })
        .expect(200);
      const body = res.body as LabWorkOrder;
      expect(body.status).toBe('RECEBIDO');
    });

    it('retorna 400 para estado inválido', async () => {
      await http
        .patch('/api/v1/lab/work-orders/wo-1/status')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'INVALIDO' })
        .expect(400);
    });

    it('retorna 401 sem token', async () => {
      await http
        .patch('/api/v1/lab/work-orders/wo-1/status')
        .send({ status: 'RECEBIDO' })
        .expect(401);
    });
  });

  describe('GET /api/v1/lab/work-orders/:id', () => {
    it('retorna OS de laboratório por ID', async () => {
      const res = await http
        .get('/api/v1/lab/work-orders/wo-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as LabWorkOrder;
      expect(body.id).toBe('wo-1');
    });

    it('retorna 401 sem token', async () => {
      await http.get('/api/v1/lab/work-orders/wo-1').expect(401);
    });
  });
});
