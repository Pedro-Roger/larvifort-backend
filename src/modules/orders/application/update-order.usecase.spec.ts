import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateOrderUseCase } from './update-order.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import type { Order } from '../domain/order';

describe('UpdateOrderUseCase', () => {
  const SAMPLE_ORDER: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    clientId: 'client-1',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    orderDate: new Date(),
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut(mocks?: {
    findOrderById?: jest.Mock;
    updateOrder?: jest.Mock;
    findClientById?: jest.Mock;
  }) {
    const ordersRepo: OrderRepositoryPort = {
      findById:
        mocks?.findOrderById ?? jest.fn().mockResolvedValue(SAMPLE_ORDER),
      update: mocks?.updateOrder ?? jest.fn().mockResolvedValue(SAMPLE_ORDER),
      create: jest.fn(),
      findByOrderNumber: jest.fn(),
      findMany: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const clientsRepo: ClientRepositoryPort = {
      findById:
        mocks?.findClientById ??
        jest.fn().mockResolvedValue({ id: 'client-1' }),
      findMany: jest.fn(),
      findByCpfCnpj: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const sut = new UpdateOrderUseCase(ordersRepo, clientsRepo);
    return { sut, ordersRepo, clientsRepo };
  }

  it('atualiza pedido com sucesso', async () => {
    const updateMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_ORDER, phase: 'APROVADO' });
    const { sut } = makeSut({ updateOrder: updateMock });

    const result = await sut.execute('order-1', { phase: 'APROVADO' });
    expect(result.phase).toBe('APROVADO');
    expect(updateMock).toHaveBeenCalledWith('order-1', { phase: 'APROVADO' });
  });

  it('lança NotFoundException se pedido não existir', async () => {
    const findMock = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findOrderById: findMock });

    await expect(sut.execute('ghost', { phase: 'APROVADO' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequestException ao tentar editar pedido cancelado', async () => {
    const findMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_ORDER, phase: 'CANCELLED' });
    const { sut } = makeSut({ findOrderById: findMock });

    await expect(sut.execute('order-1', { phase: 'APROVADO' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
