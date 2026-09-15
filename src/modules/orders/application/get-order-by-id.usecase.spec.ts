import { NotFoundException } from '@nestjs/common';
import { GetOrderByIdUseCase } from './get-order-by-id.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

describe('GetOrderByIdUseCase', () => {
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

  it('retorna pedido quando encontrado', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(SAMPLE_ORDER);
    const repo: OrderRepositoryPort = {
      findById: findByIdMock,
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const sut = new GetOrderByIdUseCase(repo);
    const result = await sut.execute('order-1');
    expect(result.id).toBe('order-1');
  });

  it('lança NotFoundException se não existir', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(null);
    const repo: OrderRepositoryPort = {
      findById: findByIdMock,
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const sut = new GetOrderByIdUseCase(repo);
    await expect(sut.execute('ghost')).rejects.toThrow(NotFoundException);
  });
});
