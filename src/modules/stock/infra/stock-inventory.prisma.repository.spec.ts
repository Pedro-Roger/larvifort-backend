import { PrismaStockInventoryRepository } from './stock-inventory.prisma.repository';

const CREATED_AT = new Date('2026-09-18T12:00:00.000Z');

function makeReservation(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    productId: 'product-1',
    stockLocationId: 'location-1',
    orderId: 'order-1',
    quantity: 10,
    status: 'ACTIVA',
    responsibleId: 'user-1',
    createdAt: CREATED_AT,
    cancelledAt: null,
    ...overrides,
  };
}

describe('PrismaStockInventoryRepository.listReservations', () => {
  it('enriquece reservas consultando vínculos distintos em lote', async () => {
    const prisma = {
      stockReservation: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            makeReservation('reservation-1'),
            makeReservation('reservation-2'),
          ]),
      },
      product: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'product-1', name: 'Pós-larva', unit: 'MILHEIRO' },
          ]),
      },
      stockLocation: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'location-1', name: 'Berçário Norte', unitId: 'unit-1' },
          ]),
      },
      stockUnit: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'unit-1', name: 'Morada Nova' }]),
      },
      order: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'order-1', orderNumber: 'PED-2026-001' }]),
      },
    };
    const repository = new PrismaStockInventoryRepository(prisma as never);

    const result = await repository.listReservations({
      status: 'ACTIVA',
      page: 2,
      limit: 10,
    });

    expect(prisma.stockReservation.findMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVA' },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['product-1'] } },
    });
    expect(prisma.stockLocation.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['location-1'] } },
    });
    expect(prisma.stockUnit.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['unit-1'] } },
    });
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['order-1'] } },
    });
    expect(result[0]).toEqual({
      ...makeReservation('reservation-1'),
      orderNumber: 'PED-2026-001',
      productName: 'Pós-larva',
      unit: 'MILHEIRO',
      unitName: 'Morada Nova',
      locationName: 'Berçário Norte',
    });
  });

  it('usa valores vazios quando vínculos opcionais não existem', async () => {
    const prisma = {
      stockReservation: {
        findMany: jest.fn().mockResolvedValue([
          makeReservation('reservation-1', {
            productId: 'missing-product',
            stockLocationId: 'missing-location',
            orderId: 'missing-order',
          }),
        ]),
      },
      product: { findMany: jest.fn().mockResolvedValue([]) },
      stockLocation: { findMany: jest.fn().mockResolvedValue([]) },
      stockUnit: { findMany: jest.fn().mockResolvedValue([]) },
      order: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const repository = new PrismaStockInventoryRepository(prisma as never);

    const [result] = await repository.listReservations({});

    expect(result).toEqual(
      expect.objectContaining({
        orderNumber: null,
        productName: '',
        unit: '',
        unitName: '',
        locationName: '',
      }),
    );
  });
});
