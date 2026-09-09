import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import jwt from 'jsonwebtoken';

type SuperTestHttp = ReturnType<typeof request>;
import { PesquisasController } from './../src/modules/pesquisas/presentation/pesquisas.controller';
import { ListPesquisasUseCase } from './../src/modules/pesquisas/application/list-pesquisas.usecase';
import { GetFieldSearchByIdUseCase } from './../src/modules/pesquisas/application/get-field-search.usecase';
import { CreateFieldSearchUseCase } from './../src/modules/pesquisas/application/create-field-search.usecase';
import { UpdateFieldSearchUseCase } from './../src/modules/pesquisas/application/update-field-search.usecase';
import { DeleteFieldSearchUseCase } from './../src/modules/pesquisas/application/delete-field-search.usecase';
import { FIELD_SEARCH_REPOSITORY_PORT } from './../src/modules/pesquisas/application/ports/field-repository.port';
import type { FieldSearch } from './../src/modules/pesquisas/domain/field-search';
import type { Paginated } from './../src/core/common/pagination';

describe('Field Searches Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  const SAMPLE_SEARCH: FieldSearch = {
    id: 'f-1',
    clienteId: 'c-1',
    cliente: {
      id: 'c-1',
      firstName: 'Carlos',
      lastName: 'Eduardo',
      email: 'carlos@fazenda.com.br',
      phone: '11988887777',
      cidade: 'Natal',
    },
    dataPesquisa: new Date('2026-09-08T00:00:00.000Z'),
    responsavelId: 'u-1',
    responsavel: {
      id: 'u-1',
      firstName: 'Fernando',
      lastName: 'Almeida',
      email: 'fernando@larvifort.com.br',
    },
    larvas: ['Larvifort', 'Outra'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [],
    outroMotivo: null,
    uniformidadeBercario: 'OTIMA',
    uniformidadeCultivo: 'BOA',
    sobrevBercario: 88,
    sobrevCultivo: 91,
    resultadosUltimoCiclo: 'Excelente produção',
    observacoes: 'Cliente satisfeito',
    createdAt: new Date('2026-09-08T00:00:00.000Z'),
    updatedAt: new Date('2026-09-08T00:00:00.000Z'),
  };

  beforeEach(async () => {
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_SEARCH], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_SEARCH);
    createMock = jest.fn().mockResolvedValue(SAMPLE_SEARCH);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_SEARCH, sobrevBercario: 95 });
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PesquisasController],
      providers: [
        ListPesquisasUseCase,
        GetFieldSearchByIdUseCase,
        CreateFieldSearchUseCase,
        UpdateFieldSearchUseCase,
        DeleteFieldSearchUseCase,
        {
          provide: FIELD_SEARCH_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock,
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
      { sub: userId, email: 'user@larvifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/pesquisas', () => {
    it('retorna lista paginada de pesquisas para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get(
          '/api/v1/pesquisas?page=1&limit=10&cliente=c-1&somenteLarvifort=true',
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<FieldSearch>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(findManyMock).toHaveBeenCalled();
    });

    it('funciona via alias /api/v1/searches', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/searches?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<FieldSearch>;
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/pesquisas').expect(401);
    });
  });

  describe('GET /api/v1/pesquisas/:id', () => {
    it('retorna pesquisa detalhada com dados de cliente e responsável', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/pesquisas/f-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as FieldSearch;
      expect(body.id).toBe('f-1');
      expect(body.cliente?.firstName).toBe('Carlos');
      expect(body.responsavel?.email).toBe('fernando@larvifort.com.br');
    });

    it('retorna 404 quando pesquisa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/pesquisas/f-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/pesquisas', () => {
    it('retorna 201 e cria pesquisa com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/pesquisas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: '123e4567-e89b-12d3-a456-426614174000',
          dataPesquisa: '2026-09-08T00:00:00.000Z',
          larvas: ['Larvifort', 'A'],
          maioriaLarvifort: true,
          parouLarvifort: false,
          uniformidadeBercario: 'OTIMA',
          sobrevBercario: 88,
          sobrevCultivo: 91,
        })
        .expect(201);

      const body = res.body as FieldSearch;
      expect(body.id).toBe('f-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 400 quando larvas for vazio', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/pesquisas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: '123e4567-e89b-12d3-a456-426614174000',
          larvas: [],
          maioriaLarvifort: true,
        })
        .expect(400);
    });

    it('retorna 400 quando parouLarvifort=true sem motivosSaida', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/pesquisas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: '123e4567-e89b-12d3-a456-426614174000',
          larvas: ['Larvifort'],
          maioriaLarvifort: false,
          parouLarvifort: true,
          motivosSaida: [],
        })
        .expect(400);
    });

    it('retorna 400 quando sobrevBercario > 100', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/pesquisas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: '123e4567-e89b-12d3-a456-426614174000',
          larvas: ['Larvifort'],
          maioriaLarvifort: true,
          sobrevBercario: 120,
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/pesquisas/:id', () => {
    it('retorna 200 e atualiza pesquisa', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/pesquisas/f-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ sobrevBercario: 95 })
        .expect(200);

      const body = res.body as FieldSearch;
      expect(body.sobrevBercario).toBe(95);
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 404 quando pesquisa não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/pesquisas/f-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ sobrevBercario: 95 })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/pesquisas/:id', () => {
    it('retorna 204 e remove pesquisa', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/pesquisas/f-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('f-1');
    });

    it('retorna 404 quando pesquisa a ser deletada não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .delete('/api/v1/pesquisas/f-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
