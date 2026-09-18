import { GetOrderStatsUseCase } from './get-order-stats.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { OrderStats } from '../domain/order';

describe('GetOrderStatsUseCase', () => {
  const SAMPLE_STATS: OrderStats = {
    totalOrders: 10,
    totalOrcamentos: 4,
    totalPedidos: 6,
    totalCancelled: 1,
    totalRevenue: 50000,
    averageTicket: 5000,
    phaseCounts: {
      ABERTO: 3,
      PENDING: 2,
      APROVADO: 3,
      FATURADO: 1,
      CANCELLED: 1,
    },
  };

  it('retorna estatísticas agregadas de pedidos', async () => {
    const getStatsMock = jest.fn().mockResolvedValue(SAMPLE_STATS);
    const repo: OrderRepositoryPort = {
      getStats: getStatsMock,
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByOrderNumber: jest.fn(),
      cancel: jest.fn(),
      close: jest.fn(),
      delete: jest.fn(),
      generateNextOrderNumber: jest.fn(),
      createCustomerEvent: jest.fn(),
      listCustomerEvents: jest.fn(),
    };

    const sut = new GetOrderStatsUseCase(repo);
    const result = await sut.execute({ clientId: 'c-1' });

    expect(result.totalOrders).toBe(10);
    expect(result.totalRevenue).toBe(50000);
    expect(getStatsMock).toHaveBeenCalledWith({ clientId: 'c-1' });
  });
});
