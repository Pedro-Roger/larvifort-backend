import { ListOrdersUseCase } from './list-orders.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

describe('ListOrdersUseCase', () => {
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

  it('lista pedidos paginados com filtros válidos', async () => {
    const findManyMock = jest.fn().mockResolvedValue({
      data: [SAMPLE_ORDER],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const repo: OrderRepositoryPort = {
      findMany: findManyMock,
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      close: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      generateNextOrderNumber: jest.fn(),
      createCustomerEvent: jest.fn(),
      listCustomerEvents: jest.fn(),
    };

    const sut = new ListOrdersUseCase(repo);
    const result = await sut.execute({ page: 1, limit: 10, status: 'PEDIDO' });

    expect(result.data).toHaveLength(1);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, status: 'PEDIDO' }),
    );
  });
});
