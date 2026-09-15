import { NotFoundException } from '@nestjs/common';
import { DeleteOrderUseCase } from './delete-order.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

describe('DeleteOrderUseCase', () => {
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

  it('exclui pedido com sucesso', async () => {
    const deleteMock = jest.fn().mockResolvedValue(undefined);
    const repo: OrderRepositoryPort = {
      findById: jest.fn().mockResolvedValue(SAMPLE_ORDER),
      delete: deleteMock,
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const sut = new DeleteOrderUseCase(repo);
    await sut.execute('order-1');
    expect(deleteMock).toHaveBeenCalledWith('order-1');
  });

  it('lança NotFoundException se não existir', async () => {
    const repo: OrderRepositoryPort = {
      findById: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const sut = new DeleteOrderUseCase(repo);
    await expect(sut.execute('ghost')).rejects.toThrow(NotFoundException);
  });
});
