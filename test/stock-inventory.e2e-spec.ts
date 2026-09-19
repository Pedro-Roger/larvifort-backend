import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { StockAvailabilityController } from '../src/modules/stock/presentation/stock-availability.controller';
import { StockMovementsController } from '../src/modules/stock/presentation/stock-movements.controller';
import { StockReservationsController } from '../src/modules/stock/presentation/stock-reservations.controller';
import { GetAvailabilityUseCase } from '../src/modules/stock/application/get-availability.usecase';
import { ListMovementsUseCase } from '../src/modules/stock/application/list-movements.usecase';
import { ListReservationsUseCase } from '../src/modules/stock/application/list-reservations.usecase';
import { RegisterMovementUseCase } from '../src/modules/stock/application/register-movement.usecase';
import { CreateReservationUseCase } from '../src/modules/stock/application/create-reservation.usecase';
import { CancelReservationUseCase } from '../src/modules/stock/application/cancel-reservation.usecase';
import { STOCK_INVENTORY_REPOSITORY_PORT } from '../src/modules/stock/application/ports/stock-inventory-repository.port';
import { STOCK_REPOSITORY_PORT } from '../src/modules/stock/application/ports/stock-repository.port';
import { PRODUCT_REPOSITORY_PORT } from '../src/modules/products/application/ports/product-repository.port';
import type { AvailabilityRow } from '../src/modules/stock/domain/availability';
import type { StockMovement } from '../src/modules/stock/domain/stock-movement';
import type {
  StockReservation,
  StockReservationListItem,
} from '../src/modules/stock/domain/stock-reservation';

describe('Stock Inventory (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  const SAMPLE_AVAILABILITY: AvailabilityRow = {
    productId: 'p-1',
    stockLocationId: 'l-1',
    unitId: 'u-1',
    unitName: 'Morada Nova',
    locationName: 'Berçário Norte',
    quantity: 100,
    reserved: 30,
    available: 70,
  };
  const SAMPLE_MOVEMENT: StockMovement = {
    id: 'm-1',
    productId: 'p-1',
    stockLocationId: 'l-1',
    type: 'ENTRADA',
    quantity: 50,
    reason: 'Compra',
    responsibleId: 'u-1',
    orderId: null,
    createdAt: new Date(),
  };
  const SAMPLE_RESERVATION: StockReservation = {
    id: 'r-1',
    productId: 'p-1',
    stockLocationId: 'l-1',
    orderId: null,
    quantity: 30,
    status: 'ACTIVA',
    responsibleId: 'u-1',
    createdAt: new Date(),
    cancelledAt: null,
  };
  const SAMPLE_RESERVATION_LIST_ITEM: StockReservationListItem = {
    ...SAMPLE_RESERVATION,
    orderNumber: null,
    productName: 'Pós-larva',
    unit: 'MILHEIRO',
    unitName: 'Morada Nova',
    locationName: 'Berçário Norte',
  };

  function makeToken(role = 'ADMIN', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'admin@larvifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  beforeEach(async () => {
    const inventoryMock = {
      getAvailability: jest.fn().mockResolvedValue([SAMPLE_AVAILABILITY]),
      getLevel: jest.fn().mockResolvedValue({ quantity: 100, reserved: 0 }),
      upsertLevel: jest.fn().mockResolvedValue(undefined),
      registerMovement: jest.fn().mockResolvedValue(SAMPLE_MOVEMENT),
      listMovements: jest.fn().mockResolvedValue([SAMPLE_MOVEMENT]),
      createReservation: jest.fn().mockResolvedValue(SAMPLE_RESERVATION),
      findReservationById: jest.fn().mockResolvedValue(SAMPLE_RESERVATION),
      cancelReservation: jest.fn().mockResolvedValue({
        ...SAMPLE_RESERVATION,
        status: 'CANCELADA',
      }),
      listReservations: jest
        .fn()
        .mockResolvedValue([SAMPLE_RESERVATION_LIST_ITEM]),
    };
    const productMock = {
      findById: jest.fn().mockResolvedValue({ id: 'p-1', code: 'POS-LARVA' }),
    };
    const stockMock = {
      findLocationById: jest.fn().mockResolvedValue({
        id: 'l-1',
        name: 'Berçário Norte',
        unitId: 'u-1',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        StockAvailabilityController,
        StockMovementsController,
        StockReservationsController,
      ],
      providers: [
        GetAvailabilityUseCase,
        ListMovementsUseCase,
        ListReservationsUseCase,
        RegisterMovementUseCase,
        CreateReservationUseCase,
        CancelReservationUseCase,
        { provide: STOCK_INVENTORY_REPOSITORY_PORT, useValue: inventoryMock },
        { provide: PRODUCT_REPOSITORY_PORT, useValue: productMock },
        { provide: STOCK_REPOSITORY_PORT, useValue: stockMock },
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

  describe('protección de endpoints', () => {
    it('retorna 401 sin token en GET /stock/availability', async () => {
      await http.get('/api/v1/stock/availability').expect(401);
    });
    it('retorna 401 sin token en POST /stock/movements', async () => {
      await http.post('/api/v1/stock/movements').send({}).expect(401);
    });
    it('retorna 401 sin token en GET /stock/reservations', async () => {
      await http.get('/api/v1/stock/reservations?status=ACTIVA').expect(401);
    });
    it('retorna 401 sin token en POST /stock/reservations', async () => {
      await http.post('/api/v1/stock/reservations').send({}).expect(401);
    });
    it('retorna 401 sin token en DELETE /stock/reservations/:id', async () => {
      await http.delete('/api/v1/stock/reservations/r-1').expect(401);
    });
  });

  describe('GET /api/v1/stock/availability', () => {
    it('retorna disponibilidad con filtros', async () => {
      const res = await http
        .get(
          '/api/v1/stock/availability?productId=p-1&unitId=u-1&locationId=l-1',
        )
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as AvailabilityRow[];
      expect(body).toHaveLength(1);
      expect(body[0].available).toBe(70);
    });
  });

  describe('POST /api/v1/stock/movements', () => {
    it('registra entrada 201', async () => {
      const res = await http
        .post('/api/v1/stock/movements')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          productId: 'p-1',
          stockLocationId: 'l-1',
          type: 'ENTRADA',
          quantity: 50,
        })
        .expect(201);
      const body = res.body as StockMovement;
      expect(body.id).toBe('m-1');
    });

    it('retorna 400 con cantidad no positiva', async () => {
      await http
        .post('/api/v1/stock/movements')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          productId: 'p-1',
          stockLocationId: 'l-1',
          type: 'ENTRADA',
          quantity: 0,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/stock/movements', () => {
    it('lista movimientos', async () => {
      const res = await http
        .get('/api/v1/stock/movements?productId=p-1&type=ENTRADA')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as StockMovement[];
      expect(body).toHaveLength(1);
      expect(body[0].type).toBe('ENTRADA');
    });
  });

  describe('GET /api/v1/stock/reservations', () => {
    it('lista reservas ativas com dados enriquecidos', async () => {
      const res = await http
        .get('/api/v1/stock/reservations?status=ACTIVA')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as StockReservationListItem[];

      expect(body).toHaveLength(1);
      expect(body[0]).toEqual(
        expect.objectContaining({
          id: 'r-1',
          orderNumber: null,
          productName: 'Pós-larva',
          unit: 'MILHEIRO',
          unitName: 'Morada Nova',
          locationName: 'Berçário Norte',
        }),
      );
    });
  });

  describe('POST /api/v1/stock/reservations', () => {
    it('crea reserva 201', async () => {
      const res = await http
        .post('/api/v1/stock/reservations')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          productId: 'p-1',
          stockLocationId: 'l-1',
          quantity: 30,
        })
        .expect(201);
      const body = res.body as StockReservation;
      expect(body.id).toBe('r-1');
    });

    it('retorna 400 si cantidad no positiva', async () => {
      await http
        .post('/api/v1/stock/reservations')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ productId: 'p-1', stockLocationId: 'l-1', quantity: -1 })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/stock/reservations/:id', () => {
    it('cancela reserva 200 y devuelve a disponibilidad', async () => {
      const res = await http
        .delete('/api/v1/stock/reservations/r-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as StockReservation;
      expect(body.status).toBe('CANCELADA');
    });
  });
});
