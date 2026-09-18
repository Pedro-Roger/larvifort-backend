import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CloseOrderUseCase } from './close-order.usecase';
import { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

function baseOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    operationalStatus: 'CONFIRMADO',
    clientId: 'client-1',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    paymentMethod: 'PIX',
    deliveryDate: new Date('2026-09-22T10:00:00.000Z'),
    shippingAddress: { city: 'Rifaina', uf: 'SP' },
    orderDate: new Date(),
    items: [
      {
        id: 'i-1',
        orderId: 'order-1',
        productName: 'Pós-larva',
        unit: 'MILHEIRO',
        quantity: 10,
        unitPrice: 50,
        discount: 0,
        totalPrice: 500,
        type: 'PRODUCT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CloseOrderUseCase', () => {
  it('cierra pedido completo y registra auditoría', async () => {
    const findById = jest.fn().mockResolvedValue(baseOrder());
    const close = jest.fn().mockResolvedValue({
      ...baseOrder(),
      operationalStatus: 'FECHADO',
      closedAt: new Date(),
      closedBy: 'user-1',
    });
    const repo = { findById, close } as unknown as OrderRepositoryPort;
    const useCase = new CloseOrderUseCase(repo);

    const result = await useCase.execute('order-1', 'user-1');

    expect(close).toHaveBeenCalledWith('order-1', 'user-1', expect.any(Date));
    expect(result.operationalStatus).toBe('FECHADO');
    expect(result.closedBy).toBe('user-1');
  });

  it('lanza 404 si el pedido no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as OrderRepositoryPort;
    const useCase = new CloseOrderUseCase(repo);

    await expect(useCase.execute('ghost', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza 400 si el pedido ya está cerrado', async () => {
    const repo = {
      findById: jest
        .fn()
        .mockResolvedValue(baseOrder({ operationalStatus: 'FECHADO' })),
    } as unknown as OrderRepositoryPort;
    const useCase = new CloseOrderUseCase(repo);

    await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lanza 400 con lista de datos obligatorios faltantes', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(
        baseOrder({
          paymentMethod: null,
          shippingAddress: null,
          deliveryDate: null,
        }),
      ),
    } as unknown as OrderRepositoryPort;
    const useCase = new CloseOrderUseCase(repo);

    await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
