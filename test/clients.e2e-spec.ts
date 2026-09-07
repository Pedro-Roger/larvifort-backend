import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

type SuperTestHttp = ReturnType<typeof request>;
import { ClientsController } from './../src/modules/clients/presentation/clients.controller';
import { ListClientsUseCase } from './../src/modules/clients/application/list-clients.usecase';
import { GetClientByIdUseCase } from './../src/modules/clients/application/get-client-by-id.usecase';
import { CreateClientUseCase } from './../src/modules/clients/application/create-client.usecase';
import { UpdateClientUseCase } from './../src/modules/clients/application/update-client.usecase';
import { DeleteClientUseCase } from './../src/modules/clients/application/delete-client.usecase';
import { CLIENT_REPOSITORY_PORT } from './../src/modules/clients/application/ports/client-repository.port';
import jwt from 'jsonwebtoken';
import type { Client } from './../src/modules/clients/domain/client';
import type { Paginated } from './../src/core/common/pagination';

describe('Clients Module (e2e)', () => {
  let app: INestApplication<App>;
  let http: SuperTestHttp;

  let findManyMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findByCpfCnpjMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  const SAMPLE_CLIENT: Client = {
    id: 'c-1',
    firstName: 'João',
    lastName: 'Pescador',
    email: 'joao@fazenda.com.br',
    phone: '11999999999',
    birthdate: new Date('1980-05-10'),
    cpfCnpj: '12345678901',
    statusLead: 'NOVO',
    origem: 'Site',
    pais: 'Brasil',
    cidade: 'Rifaina',
    uf: 'SP',
    endereco: 'Fazenda Rio Grande',
    observacoes: 'Cliente potencial',
    empresaId: 'e-1',
    laminaAgua: 5000,
    qtdViveiros: 4,
    densidade: 30,
    producaoMedia: 12000,
    temBercario: true,
    qtdBercarios: 2,
    volumeBercarios: 500,
    alimentadorAutomatico: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  beforeEach(async () => {
    findManyMock = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_CLIENT], total: 1 });
    findByIdMock = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    findByCpfCnpjMock = jest.fn().mockResolvedValue(null);
    createMock = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_CLIENT, firstName: 'Atualizado' });
    deleteMock = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ListClientsUseCase,
        GetClientByIdUseCase,
        CreateClientUseCase,
        UpdateClientUseCase,
        DeleteClientUseCase,
        {
          provide: CLIENT_REPOSITORY_PORT,
          useValue: {
            findMany: findManyMock,
            findById: findByIdMock,
            findByCpfCnpj: findByCpfCnpjMock,
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
      { sub: userId, email: 'user@lavifort.com.br', role },
      secret,
      { expiresIn: '15m' },
    );
  }

  describe('GET /api/v1/clients', () => {
    it('retorna lista paginada de clientes para requisição autenticada', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/clients?page=1&limit=10&search=joao&status=NOVO')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Client>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('funciona via rota alias /api/v1/clientes', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/clientes?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Paginated<Client>;
      expect(body.data).toHaveLength(1);
    });

    it('retorna 401 sem header Authorization', async () => {
      await http.get('/api/v1/clients').expect(401);
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    it('retorna cliente por id', async () => {
      const token = makeToken();

      const res = await http
        .get('/api/v1/clients/c-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as Client;
      expect(body.id).toBe('c-1');
      expect(body.firstName).toBe('João');
    });

    it('retorna 404 quando cliente não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .get('/api/v1/clients/c-ghost')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/clients', () => {
    it('retorna 201 e cria cliente com sucesso', async () => {
      const token = makeToken();

      const res = await http
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'João',
          lastName: 'Pescador',
          email: 'joao@fazenda.com.br',
          cpfCnpj: '12345678901',
          statusLead: 'NOVO',
          temBercario: true,
          qtdBercarios: 2,
          volumeBercarios: 500,
        })
        .expect(201);

      const body = res.body as Client;
      expect(body.id).toBe('c-1');
      expect(createMock).toHaveBeenCalled();
    });

    it('retorna 409 Conflict quando CPF/CNPJ já existe', async () => {
      findByCpfCnpjMock.mockResolvedValue(SAMPLE_CLIENT);
      const token = makeToken();

      await http
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'João',
          lastName: 'Pescador',
          cpfCnpj: '12345678901',
        })
        .expect(409);
    });

    it('retorna 400 com body inválido', async () => {
      const token = makeToken();

      await http
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: '', lastName: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/clients/:id', () => {
    it('retorna 200 e atualiza campos do cliente', async () => {
      const token = makeToken();

      const res = await http
        .patch('/api/v1/clients/c-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Atualizado' })
        .expect(200);

      const body = res.body as Client;
      expect(body.firstName).toBe('Atualizado');
      expect(updateMock).toHaveBeenCalled();
    });

    it('retorna 200 ao atualizar status via /status', async () => {
      updateMock.mockResolvedValue({
        ...SAMPLE_CLIENT,
        statusLead: 'CLIENTE_ATIVO',
      });
      const token = makeToken();

      const res = await http
        .patch('/api/v1/clients/c-1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CLIENTE_ATIVO' })
        .expect(200);

      const body = res.body as Client;
      expect(body.statusLead).toBe('CLIENTE_ATIVO');
    });

    it('retorna 404 quando cliente não existe', async () => {
      findByIdMock.mockResolvedValue(null);
      const token = makeToken();

      await http
        .patch('/api/v1/clients/c-ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Atualizado' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/clients/:id', () => {
    it('retorna 204 e deleta cliente', async () => {
      const token = makeToken();

      await http
        .delete('/api/v1/clients/c-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(deleteMock).toHaveBeenCalledWith('c-1');
    });
  });
});
