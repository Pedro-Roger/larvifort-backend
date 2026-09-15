import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderUseCase } from './create-order.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import type { Order } from '../domain/order';

describe('CreateOrderUseCase', () => {
  const SAMPLE_CLIENT = {
    id: 'client-1',
    firstName: 'Carlos',
    lastName: 'Ferreira',
    empresaId: 'emp-1',
  };

  const SAMPLE_ORDER: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    clientId: 'client-1',
    clientName: 'Carlos Ferreira',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut(mocks?: {
    createOrder?: jest.Mock;
    findClientById?: jest.Mock;
    generateNextOrderNumber?: jest.Mock;
    findActiveAutomations?: jest.Mock;
    publishOutbox?: jest.Mock;
  }) {
    const ordersRepo: OrderRepositoryPort = {
      create: mocks?.createOrder ?? jest.fn().mockResolvedValue(SAMPLE_ORDER),
      update: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      findMany: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber:
        mocks?.generateNextOrderNumber ?? jest.fn().mockResolvedValue('ORD-2026-0001'),
    };

    const clientsRepo: ClientRepositoryPort = {
      findById: mocks?.findClientById ?? jest.fn().mockResolvedValue(SAMPLE_CLIENT),
      findMany: jest.fn(),
      findByCpfCnpj: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const outbox = {
      publish: mocks?.publishOutbox ?? jest.fn().mockResolvedValue(undefined),
    };

    const automationsRepo = {
      findActiveByTrigger:
        mocks?.findActiveAutomations ?? jest.fn().mockResolvedValue([]),
      findMany: jest.fn(),
      findById: jest.fn(),
      findActiveByEvent: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const sut = new CreateOrderUseCase(
      ordersRepo,
      clientsRepo,
      outbox as never,
      automationsRepo as never,
    );

    return { sut, ordersRepo, clientsRepo, outbox, automationsRepo };
  }

  it('cria pedido com sucesso e herda empresaId do cliente', async () => {
    const createMock = jest.fn().mockResolvedValue(SAMPLE_ORDER);
    const { sut } = makeSut({ createOrder: createMock });

    const result = await sut.execute({
      clientId: 'client-1',
      items: [
        {
          productName: 'Larva PL10',
          quantity: 10,
          unitPrice: 100,
        },
      ],
    });

    expect(result.id).toBe('order-1');
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        companyId: 'emp-1',
        orderNumber: 'ORD-2026-0001',
        status: 'PEDIDO',
        phase: 'ABERTO',
      }),
    );
  });

  it('lança BadRequestException se clientId for vazio', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        clientId: '',
        items: [{ productName: 'P1', quantity: 1, unitPrice: 10 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança NotFoundException se cliente não existir', async () => {
    const findClientMock = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findClientById: findClientMock });

    await expect(
      sut.execute({
        clientId: 'client-ghost',
        items: [{ productName: 'P1', quantity: 1, unitPrice: 10 }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança BadRequestException se itens for vazio', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        clientId: 'client-1',
        items: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança BadRequestException se item tiver quantidade <= 0', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        clientId: 'client-1',
        items: [{ productName: 'P1', quantity: 0, unitPrice: 10 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('publica evento ORDER_CREATED no outbox quando há automação ativa', async () => {
    const publishMock = jest.fn().mockResolvedValue(undefined);
    const findAutomationsMock = jest.fn().mockResolvedValue([
      { id: 'auto-1', projetoId: 'proj-1', trigger: 'ORDER_CREATED' },
    ]);

    const { sut } = makeSut({
      publishOutbox: publishMock,
      findActiveAutomations: findAutomationsMock,
    });

    await sut.execute({
      clientId: 'client-1',
      items: [{ productName: 'P1', quantity: 5, unitPrice: 20 }],
    });

    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ORDER_CREATED',
        projetoId: 'proj-1',
        aggregateId: 'order-1',
      }),
    );
  });
});
