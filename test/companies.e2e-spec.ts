import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { CompaniesController } from './../src/modules/companies/presentation/companies.controller';
import { ListCompaniesUseCase } from './../src/modules/companies/application/list-companies.usecase';
import { GetCompanyByIdUseCase } from './../src/modules/companies/application/get-company-by-id.usecase';
import { CreateCompanyUseCase } from './../src/modules/companies/application/create-company.usecase';
import { UpdateCompanyUseCase } from './../src/modules/companies/application/update-company.usecase';
import { DeleteCompanyUseCase } from './../src/modules/companies/application/delete-company.usecase';
import { ListCommercialGroupsUseCase } from './../src/modules/companies/application/list-commercial-groups.usecase';
import { COMPANY_REPOSITORY_PORT } from './../src/modules/companies/application/ports/company-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './../src/modules/companies/application/ports/commercial-group-repository.port';
import jwt from 'jsonwebtoken';
import type { Company } from './../src/modules/companies/domain/company';
import type { Paginated } from './../src/core/common/pagination';

describe('Companies Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByCnpjMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Fazenda Rio Grande Ltda',
    cnpj: '12345678000199',
    city: 'Rifaina',
    status: 'ATIVA',
    grupoId: 'g-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_COMPANY], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    findByCnpjMock = jest.fn().mockResolvedValue(null);
    createMock = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_COMPANY, name: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        ListCompaniesUseCase,
        GetCompanyByIdUseCase,
        CreateCompanyUseCase,
        UpdateCompanyUseCase,
        DeleteCompanyUseCase,
        ListCommercialGroupsUseCase,
        {
          provide: COMPANY_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            findByCnpj: findByCnpjMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
        {
          provide: COMMERCIAL_GROUP_REPOSITORY_PORT,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

  function makeToken(role = 'USER', userId = 'u-1'): string {
    const secret = process.env.JWT_SECRET ?? 'lavifort-dev-secret';
    return jwt.sign(
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/companies', () => {
    it('retorna lista paginada de empresas para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/companies?page=1&limit=10&search=rio&status=ATIVA')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Company>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('funciona via rota alias /api/v1/empresas', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/empresas?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Company>;
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/companies').expect(401);
    });
  });

  describe('GET /api/v1/companies/:id', () => {
    it('retorna empresa por id', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/companies/e-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Company;
      expect(body.id).toBe('e-1');
      expect(body.name).toBe('Fazenda Rio Grande Ltda');
    });

    it('retorna 404 quando empresa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/companies/e-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/companies', () => {
    it('retorna 201 e cria empresa com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Fazenda Rio Grande Ltda',
          cnpj: '12345678000199',
          city: 'Rifaina',
          status: 'ATIVA',
        })
        .expect(201);

      const body = res.body as Company;
      expect(body.id).toBe('e-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 409 Conflict quando CNPJ já existe', async () => {
      findByCnpjMock.mockResolvedValue(SAMPLE_COMPANY);
      const token = makeToken();

      await http
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Fazenda Rio Grande Ltda',
          cnpj: '12345678000199',
        })
        .expect(409);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/companies/:id', () => {
    it('retorna 200 e atualiza campos da empresa', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/companies/e-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(200);

      const body = res.body as Company;
      expect(body.name).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando empresa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/companies/e-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/companies/:id', () => {
    it('retorna 204 e deleta empresa', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/companies/e-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('e-1');
    });
  });
});
