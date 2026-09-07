import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { CommercialGroupsController } from './../src/modules/companies/presentation/commercial-groups.controller';
import { ListCommercialGroupsUseCase } from './../src/modules/companies/application/list-commercial-groups.usecase';
import { GetCommercialGroupByIdUseCase } from './../src/modules/companies/application/get-commercial-group-by-id.usecase';
import { CreateCommercialGroupUseCase } from './../src/modules/companies/application/create-commercial-group.usecase';
import { UpdateCommercialGroupUseCase } from './../src/modules/companies/application/update-commercial-group.usecase';
import { DeleteCommercialGroupUseCase } from './../src/modules/companies/application/delete-commercial-group.usecase';
import { GetCompaniesByGroupIdUseCase } from './../src/modules/companies/application/get-companies-by-group-id.usecase';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './../src/modules/companies/application/ports/commercial-group-repository.port';
import jwt from 'jsonwebtoken';
import type {
  CommercialGroup,
  Company,
} from './../src/modules/companies/domain/company';

describe('Commercial Groups Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findAllMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByNameMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;
  let findCompaniesByGroupIdMock: jest.Mock;

  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Empresa 1',
    cnpj: null,
    city: 'Rifaina',
    status: 'ATIVA',
    grupoId: 'g-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    findAllMock = jest.fn().mockResolvedValue([SAMPLE_GROUP]);
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    findByNameMock = jest.fn().mockResolvedValue(null);
    createMock = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_GROUP, name: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);
    findCompaniesByGroupIdMock = jest.fn().mockResolvedValue([SAMPLE_COMPANY]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommercialGroupsController],
      providers: [
        ListCommercialGroupsUseCase,
        GetCommercialGroupByIdUseCase,
        CreateCommercialGroupUseCase,
        UpdateCommercialGroupUseCase,
        DeleteCommercialGroupUseCase,
        GetCompaniesByGroupIdUseCase,
        {
          provide: COMMERCIAL_GROUP_REPOSITORY_PORT,
          useValue: {
            findAll: findAllMock,
            findById: findByIdMock,
            findByName: findByNameMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
            findCompaniesByGroupId: findCompaniesByGroupIdMock,
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

  describe('GET /api/v1/commercial-groups', () => {
    it('retorna lista de grupos comerciais para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/commercial-groups')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as CommercialGroup[];
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Coopercitrus');
    });

    it('funciona via rota alias /api/v1/grupos', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/grupos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as CommercialGroup[];
      expect(body).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/commercial-groups').expect(401);
    });
  });

  describe('GET /api/v1/commercial-groups/:id', () => {
    it('retorna grupo por id', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/commercial-groups/g-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as CommercialGroup;
      expect(body.id).toBe('g-1');
      expect(body.name).toBe('Coopercitrus');
    });

    it('retorna 404 quando grupo não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/commercial-groups/g-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/commercial-groups/:id/companies & /grupos/:id/empresas', () => {
    it('retorna empresas pertencentes ao grupo', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/commercial-groups/g-1/companies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Company[];
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Empresa 1');
    });

    it('funciona via rota alias /api/v1/grupos/:id/empresas', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/grupos/g-1/empresas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Company[];
      expect(body).toHaveLength(1);
    });
  });

  describe('POST /api/v1/commercial-groups', () => {
    it('retorna 201 e cria grupo com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/commercial-groups')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Coopercitrus', color: '#16a34a' })
        .expect(201);

      const body = res.body as CommercialGroup;
      expect(body.id).toBe('g-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 409 Conflict quando nome do grupo já existe', async () => {
      findByNameMock.mockResolvedValue(SAMPLE_GROUP);
      const token = makeToken();

      await http
        .post('/api/v1/commercial-groups')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Coopercitrus' })
        .expect(409);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/commercial-groups')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/commercial-groups/:id', () => {
    it('retorna 200 e atualiza campos do grupo', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/commercial-groups/g-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(200);

      const body = res.body as CommercialGroup;
      expect(body.name).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando grupo não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/commercial-groups/g-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/commercial-groups/:id', () => {
    it('retorna 204 e deleta grupo', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/commercial-groups/g-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('g-1');
    });
  });
});
