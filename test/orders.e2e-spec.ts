import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { OrdersController } from '../src/modules/orders/presentation/orders.controller';
import { CreateOrderUseCase } from '../src/modules/orders/application/create-order.usecase';
import { ListOrdersUseCase } from '../src/modules/orders/application/list-orders.usecase';
import { GetOrderByIdUseCase } from '../src/modules/orders/application/get-order-by-id.usecase';
import { GetOrderByNumberUseCase } from '../src/modules/orders/application/get-order-by-number.usecase';
import { UpdateOrderUseCase } from '../src/modules/orders/application/update-order.usecase';
import { CancelOrderUseCase } from '../src/modules/orders/application/cancel-order.usecase';
import { GetOrderStatsUseCase } from '../src/modules/orders/application/get-order-stats.usecase';
import { DeleteOrderUseCase } from '../src/modules/orders/application/delete-order.usecase';
import { ORDER_REPOSITORY_PORT } from '../src/modules/orders/application/ports/order-repository.port';
import { CLIENT_REPOSITORY_PORT } from '../src/modules/clients/application/ports/client-repository.port';
import type { Order, OrderStats } from '../src/modules/orders/domain/order';

type SuperTestHttp = ReturnType<typeof request>;

describe('Orders Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByOrderNumberMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let cancelMock: jest.Mock;
  let deleteMock: jest.Mock;
  let getStatsMock: jest.Mock;
  let findClientByIdMock: jest.Mock;

  const SAMPLE_CLIENT = {
    id: 'client-1',
    firstName: 'João',
    lastName: 'Silva',
    empresaId: 'emp-1',
  };

  const SAMPLE_ORDER: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    clientId: 'client-1',
    clientName: 'João Silva',
    companyId: 'emp-1',
    subtotal: 1000,
    discount: 50,
    shippingCost: 30,
    taxAmount: 0,
    totalAmount: 980,
    orderDate: new Date('2026-09-15'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
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

  const SAMPLE_STATS: OrderStats = {
    totalOrders: 5,
    totalOrcamentos: 2,
    totalPedidos: 3,
    totalCancelled: 0,
    totalRevenue: 25000,
    averageTicket: 5000,
    phaseCounts: { ABERTO: 2, APROVADO: 3 },
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
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_ORDER], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_ORDER);
    findByOrderNumberMock = jest.fn().mockResolvedValue(SAMPLE_ORDER);
    createMock = jest.fn().mockResolvedValue(SAMPLE_ORDER);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_ORDER, phase: 'APROVADO' });
    cancelMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_ORDER, phase: 'CANCELLED' });
    deleteMock = jest.fn().mockResolvedValue(undefined);
    getStatsMock = jest.fn().mockResolvedValue(SAMPLE_STATS);
    findClientByIdMock = jest.fn().mockResolvedValue(SAMPLE_CLIENT);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        CreateOrderUseCase,
        ListOrdersUseCase,
        GetOrderByIdUseCase,
        GetOrderByNumberUseCase,
        UpdateOrderUseCase,
        CancelOrderUseCase,
        GetOrderStatsUseCase,
        DeleteOrderUseCase,
        {
          provide: ORDER_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            findByOrderNumber: findByOrderNumberMock,
            create: createMock,
            update: updateMock,
            cancel: cancelMock,
            delete: deleteMock,
            getStats: getStatsMock,
            generateNextOrderNumber: jest
              .fn()
              .mockResolvedValue('ORD-2026-0001'),
          },
        },
        {
          provide: CLIENT_REPOSITORY_PORT,
          useValue: {
            findById: findClientByIdMock,
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

  describe('GET /api/v1/orders', () => {
    it('retorna lista paginada de pedidos para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/orders?page=1&limit=10&status=PEDIDO&search=João')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as { data: Order[]; total: number };
      expect(body.data).toHaveLength(1);
      expect(findManyMock).toHaveBeenCalled();
    });

    it('funciona via rota alias /api/v1/pedidos', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/pedidos?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as { data: Order[] };
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/orders').expect(401);
    });
  });

  describe('GET /api/v1/orders/stats', () => {
    it('retorna estatísticas agregadas de pedidos', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/orders/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as OrderStats;
      expect(body.totalOrders).toBe(5);
      expect(body.totalRevenue).toBe(25000);
      expect(getStatsMock).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/number/:orderNumber', () => {
    it('retorna pedido pelo código legível', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/orders/number/ORD-2026-0001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Order;
      expect(body.orderNumber).toBe('ORD-2026-0001');
    });

    it('retorna 404 quando número não existe', async () => {
      findByOrderNumberMock.mockResolvedValueOnce(null);
      const token = makeToken();

      await http
        .get('/api/v1/orders/number/ORD-GHOST')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('retorna pedido por ID', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/orders/order-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Order;
      expect(body.id).toBe('order-1');
      expect(body.items).toHaveLength(1);
    });

    it('retorna 404 quando ID não existe', async () => {
      findByIdMock.mockResolvedValueOnce(null);
      const token = makeToken();

      await http
        .get('/api/v1/orders/ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/orders', () => {
    it('retorna 201 e cria pedido com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: 'client-1',
          status: 'PEDIDO',
          phase: 'ABERTO',
          items: [
            {
              productName: 'Larva PL10',
              quantity: 10,
              unitPrice: 100,
            },
          ],
        })
        .expect(201);

      const body = res.body as Order;
      expect(body.id).toBe('order-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 404 quando cliente não existe', async () => {
      findClientByIdMock.mockResolvedValueOnce(null);
      const token = makeToken();

      await http
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: 'ghost-client',
          items: [{ productName: 'Larva PL10', quantity: 10, unitPrice: 100 }],
        })
        .expect(404);
    });

    it('retorna 400 sem itens', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: 'client-1',
          items: [],
        })
        .expect(400);
    });
  });

  describe('PUT /api/v1/orders/:id & PATCH /api/v1/orders/:id', () => {
    it('retorna 200 e atualiza pedido', async () => {
      const token = makeToken();

      const res = await http
        .put('/api/v1/orders/order-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ phase: 'APROVADO' })
        .expect(200);

      const body = res.body as Order;
      expect(body.phase).toBe('APROVADO');
      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/orders/:id/cancel', () => {
    it('retorna 200 e cancela pedido', async () => {
      const token = makeToken();

      const res = await http
        .put('/api/v1/orders/order-1/cancel')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Cliente adiou compra' })
        .expect(200);

      const body = res.body as Order;
      expect(body.phase).toBe('CANCELLED');
      expect(cancelMock).toHaveBeenCalled();
    });

    it('retorna 400 sem motivo de cancelamento', async () => {
      const token = makeToken();

      await http
        .put('/api/v1/orders/order-1/cancel')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: '' })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/orders/:id', () => {
    it('retorna 204 e exclui pedido', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/orders/order-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('order-1');
    });
  });
});
