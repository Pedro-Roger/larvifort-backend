import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CancelOrderUseCase } from './cancel-order.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

describe('CancelOrderUseCase', () => {
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
    cancelOrder?: jest.Mock;
  }) {
    const ordersRepo: OrderRepositoryPort = {
      findById:
        mocks?.findOrderById ?? jest.fn().mockResolvedValue(SAMPLE_ORDER),
      cancel:
        mocks?.cancelOrder ??
        jest.fn().mockResolvedValue({
          ...SAMPLE_ORDER,
          phase: 'CANCELLED',
          cancellationReason: 'Cliente desistiu',
          cancelledAt: new Date(),
        }),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
    };

    const sut = new CancelOrderUseCase(ordersRepo);
    return { sut, ordersRepo };
  }

  it('cancela pedido com motivo e registra horário', async () => {
    const cancelMock = jest.fn().mockResolvedValue({
      ...SAMPLE_ORDER,
      phase: 'CANCELLED',
      cancellationReason: 'Cliente desistiu',
      cancelledAt: new Date(),
    });
    const { sut } = makeSut({ cancelOrder: cancelMock });

    const result = await sut.execute('order-1', 'Cliente desistiu');
    expect(result.phase).toBe('CANCELLED');
    expect(cancelMock).toHaveBeenCalledWith(
      'order-1',
      'Cliente desistiu',
      expect.any(Date),
    );
  });

  it('lança BadRequestException se motivo for vazio', async () => {
    const { sut } = makeSut();
    await expect(sut.execute('order-1', '')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lança NotFoundException se pedido não existir', async () => {
    const findMock = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findOrderById: findMock });
    await expect(sut.execute('ghost', 'Motivo')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequestException se pedido já estiver cancelado', async () => {
    const findMock = jest
      .fn()
      .mockResolvedValue({ ...SAMPLE_ORDER, phase: 'CANCELLED' });
    const { sut } = makeSut({ findOrderById: findMock });
    await expect(sut.execute('order-1', 'Motivo')).rejects.toThrow(
      BadRequestException,
    );
  });
});
