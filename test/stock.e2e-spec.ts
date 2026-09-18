import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { StockUnitsController } from '../src/modules/stock/presentation/stock-units.controller';
import { StockLocationsController } from '../src/modules/stock/presentation/stock-locations.controller';
import { CreateStockUnitUseCase } from '../src/modules/stock/application/create-stock-unit.usecase';
import { UpdateStockUnitUseCase } from '../src/modules/stock/application/update-stock-unit.usecase';
import { ListStockUnitsUseCase } from '../src/modules/stock/application/list-stock-units.usecase';
import { CreateStockLocationUseCase } from '../src/modules/stock/application/create-stock-location.usecase';
import { UpdateStockLocationUseCase } from '../src/modules/stock/application/update-stock-location.usecase';
import { ListStockLocationsUseCase } from '../src/modules/stock/application/list-stock-locations.usecase';
import { STOCK_REPOSITORY_PORT } from '../src/modules/stock/application/ports/stock-repository.port';
import type { StockUnit } from '../src/modules/stock/domain/stock-unit';
import type { StockLocation } from '../src/modules/stock/domain/stock-location';

describe('Stock Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let saveUnitMock: jest.Mock;
  let findUnitByIdMock: jest.Mock;
  let findUnitByNameMock: jest.Mock;
  let listUnitsMock: jest.Mock;
  let updateUnitMock: jest.Mock;
  let saveLocationMock: jest.Mock;
  let findLocationByIdMock: jest.Mock;
  let listLocationsMock: jest.Mock;
  let updateLocationMock: jest.Mock;

  const SAMPLE_UNIT: StockUnit = {
    id: 'u-1',
    name: 'Morada Nova',
    city: 'Morada Nova',
    status: 'ACTIVA',
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  };

  const SAMPLE_LOCATION: StockLocation = {
    id: 'l-1',
    name: 'Berçário Norte',
    unitId: 'u-1',
    type: 'BERCARIO',
    capacity: 5000,
    status: 'ACTIVA',
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
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
    saveUnitMock = jest.fn().mockResolvedValue(SAMPLE_UNIT);
    findUnitByIdMock = jest.fn().mockResolvedValue(SAMPLE_UNIT);
    findUnitByNameMock = jest.fn().mockResolvedValue(null);
    listUnitsMock = jest.fn().mockResolvedValue([SAMPLE_UNIT]);
    updateUnitMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_UNIT, city: 'Itarema' });
    saveLocationMock = jest.fn().mockResolvedValue(SAMPLE_LOCATION);
    findLocationByIdMock = jest.fn().mockResolvedValue(SAMPLE_LOCATION);
    listLocationsMock = jest.fn().mockResolvedValue([SAMPLE_LOCATION]);
    updateLocationMock = jest.fn().mockResolvedValue({
      ...SAMPLE_LOCATION,
      capacity: 6000,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockUnitsController, StockLocationsController],
      providers: [
        CreateStockUnitUseCase,
        UpdateStockUnitUseCase,
        ListStockUnitsUseCase,
        CreateStockLocationUseCase,
        UpdateStockLocationUseCase,
        ListStockLocationsUseCase,
        {
          provide: STOCK_REPOSITORY_PORT,
          useValue: {
            saveUnit: saveUnitMock,
            findUnitById: findUnitByIdMock,
            findUnitByName: findUnitByNameMock,
            listUnits: listUnitsMock,
            updateUnit: updateUnitMock,
            saveLocation: saveLocationMock,
            findLocationById: findLocationByIdMock,
            listLocations: listLocationsMock,
            updateLocation: updateLocationMock,
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

  describe('protección de endpoints', () => {
    it('retorna 401 sin token en GET /stock/units', async () => {
      await http.get('/api/v1/stock/units').expect(401);
    });
    it('retorna 401 sin token en POST /stock/units', async () => {
      await http.post('/api/v1/stock/units').send({ name: 'X' }).expect(401);
    });
    it('retorna 401 sin token en GET /stock/locations', async () => {
      await http.get('/api/v1/stock/locations').expect(401);
    });
    it('retorna 401 sin token en POST /stock/locations', async () => {
      await http
        .post('/api/v1/stock/locations')
        .send({ name: 'X', unitId: 'u-1' })
        .expect(401);
    });
  });

  describe('Units /api/v1/stock/units', () => {
    it('POST crea unidad 201', async () => {
      const res = await http
        .post('/api/v1/stock/units')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Morada Nova', city: 'Morada Nova' })
        .expect(201);
      const body = res.body as StockUnit;
      expect(body.id).toBe('u-1');
      expect(saveUnitMock).toHaveBeenCalled();
    });

    it('POST retorna 400 sin nombre', async () => {
      await http
        .post('/api/v1/stock/units')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ city: 'X' })
        .expect(400);
    });

    it('POST retorna 409 si nombre existe', async () => {
      findUnitByNameMock.mockResolvedValue({ id: 'other' });
      await http
        .post('/api/v1/stock/units')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Morada Nova' })
        .expect(409);
    });

    it('GET lista unidades 200', async () => {
      const res = await http
        .get('/api/v1/stock/units')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as StockUnit[];
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Morada Nova');
    });

    it('PATCH actualiza unidad 200', async () => {
      const res = await http
        .patch('/api/v1/stock/units/u-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ city: 'Itarema' })
        .expect(200);
      const body = res.body as StockUnit;
      expect(updateUnitMock).toHaveBeenCalled();
      expect(body.city).toBe('Itarema');
    });

    it('PATCH retorna 404 si unidad no existe', async () => {
      findUnitByIdMock.mockResolvedValue(null);
      await http
        .patch('/api/v1/stock/units/ghost')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ city: 'X' })
        .expect(404);
    });
  });

  describe('Locations /api/v1/stock/locations', () => {
    it('POST crea local 201', async () => {
      const res = await http
        .post('/api/v1/stock/locations')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Berçário Norte', unitId: 'u-1', type: 'BERCARIO' })
        .expect(201);
      const body = res.body as StockLocation;
      expect(body.id).toBe('l-1');
      expect(saveLocationMock).toHaveBeenCalled();
    });

    it('POST retorna 404 si unidad no existe', async () => {
      findUnitByIdMock.mockResolvedValue(null);
      await http
        .post('/api/v1/stock/locations')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'X', unitId: 'ghost' })
        .expect(404);
    });

    it('GET lista locais con filtro por unidad/tipo 200', async () => {
      const res = await http
        .get('/api/v1/stock/locations?unitId=u-1&type=BERCARIO')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);
      const body = res.body as StockLocation[];
      expect(listLocationsMock).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: 'u-1', type: 'BERCARIO' }),
      );
      expect(body).toHaveLength(1);
    });

    it('PATCH actualiza local 200', async () => {
      const res = await http
        .patch('/api/v1/stock/locations/l-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ capacity: 6000 })
        .expect(200);
      const body = res.body as StockLocation;
      expect(updateLocationMock).toHaveBeenCalled();
      expect(body.capacity).toBe(6000);
    });

    it('PATCH retorna 404 si local no existe', async () => {
      findLocationByIdMock.mockResolvedValue(null);
      await http
        .patch('/api/v1/stock/locations/ghost')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ capacity: 10 })
        .expect(404);
    });
  });
});
