import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { ProductsController } from '../src/modules/products/presentation/products.controller';
import { CreateProductUseCase } from '../src/modules/products/application/create-product.usecase';
import { UpdateProductUseCase } from '../src/modules/products/application/update-product.usecase';
import { GetProductByIdUseCase } from '../src/modules/products/application/get-product-by-id.usecase';
import { PRODUCT_REPOSITORY_PORT } from '../src/modules/products/application/ports/product-repository.port';
import type { Product } from '../src/modules/products/domain/product';

describe('Products Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findAllMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByCodeMock: jest.Mock;
  let saveMock: jest.Mock;
  let updateMock: jest.Mock;

  const SAMPLE_PRODUCT: Product = {
    id: 'p-1',
    code: 'POS-LARVA',
    name: 'Pós-larva',
    unit: 'MILHEIRO',
    price: 150,
    isActive: true,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    findAllMock = jest.fn().mockResolvedValue([SAMPLE_PRODUCT]);
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_PRODUCT);
    findByCodeMock = jest.fn().mockResolvedValue(null);
    saveMock = jest.fn().mockResolvedValue(SAMPLE_PRODUCT);
    updateMock = jest.fn().mockResolvedValue({ ...SAMPLE_PRODUCT, price: 200 });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        CreateProductUseCase,
        UpdateProductUseCase,
        GetProductByIdUseCase,
        {
          provide: PRODUCT_REPOSITORY_PORT,
          useValue: {
            findAll: findAllMock,
            findById: findByIdMock,
            findByCode: findByCodeMock,
            save: saveMock,
            update: updateMock,
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

  function makeToken(role = 'ADMIN', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'admin@larvifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('protección de endpoints', () => {
    it('retorna 401 sin token en GET /products', async () => {
      await http.get('/api/v1/products').expect(401);
    });

    it('retorna 401 sin token en POST /products', async () => {
      await http
        .post('/api/v1/products')
        .send({ code: 'X', name: 'X', unit: 'UN' })
        .expect(401);
    });

    it('retorna 401 sin token en PATCH /products/:id', async () => {
      await http.patch('/api/v1/products/p-1').send({ price: 10 }).expect(401);
    });
  });

  describe('GET /api/v1/products', () => {
    it('retorna lista de produtos autenticado', async () => {
      const res = await http
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);

      const body = res.body as Product[];
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('p-1');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('retorna produto por id autenticado', async () => {
      const res = await http
        .get('/api/v1/products/p-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(200);

      const body = res.body as Product;
      expect(body.id).toBe('p-1');
      expect(body.code).toBe('POS-LARVA');
    });

    it('retorna 404 cuando no existe', async () => {
      findByIdMock.mockResolvedValue(null);
      await http
        .get('/api/v1/products/ghost')
        .set('Authorization', `Bearer ${makeToken()}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/products', () => {
    it('retorna 201 y crea producto', async () => {
      const res = await http
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          code: 'POS-LARVA',
          name: 'Pós-larva',
          unit: 'MILHEIRO',
          price: 150,
        })
        .expect(201);

      expect(saveMock).toHaveBeenCalled();
      const body = res.body as Product;
      expect(body.id).toBe('p-1');
    });

    it('retorna 400 cuando falta code/name/unit', async () => {
      await http
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ price: 100 })
        .expect(400);
    });

    it('retorna 409 cuando el código ya existe', async () => {
      findByCodeMock.mockResolvedValue({ id: 'other' });
      await http
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ code: 'POS-LARVA', name: 'Pós-larva', unit: 'MILHEIRO' })
        .expect(409);
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('retorna 200 y actualiza producto', async () => {
      const res = await http
        .patch('/api/v1/products/p-1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ price: 200 })
        .expect(200);

      expect(updateMock).toHaveBeenCalled();
      const body = res.body as Product;
      expect(body.price).toBe(200);
    });

    it('retorna 404 cuando producto no existe', async () => {
      findByIdMock.mockResolvedValue(null);
      await http
        .patch('/api/v1/products/ghost')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ price: 10 })
        .expect(404);
    });
  });
});
