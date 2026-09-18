/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaLabRepository } from './lab.prisma.repository';

describe('PrismaLabRepository', () => {
  const SAMPLE_WO_ROW = {
    id: 'wo-1',
    orderId: 'order-1',
    orderNumber: 'ORD-2026-0001',
    clientName: 'João Silva',
    productId: 'p-1',
    productName: 'Pós-larva',
    quantity: 10,
    unit: 'MILHEIRO',
    stockUnitId: null,
    stockUnitName: null,
    stockLocationId: null,
    stockLocationName: null,
    deliveryDate: new Date('2026-09-25'),
    status: 'AGUARDANDO_LABORATORIO',
    statusChangedBy: null,
    statusChangedAt: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_ORDER_ROW = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    clientId: 'client-1',
    operationalStatus: 'FECHADO',
    deliveryDate: new Date('2026-09-25'),
    client: { firstName: 'João', lastName: 'Silva' },
    items: [
      {
        id: 'item-1',
        productId: 'p-1',
        productName: 'Pós-larva',
        unit: 'MILHEIRO',
        quantity: 10,
        deletedAt: null,
      },
    ],
  };

  function makeSut(overrides?: Record<string, unknown>) {
    const prismaMock = {
      labWorkOrder: {
        create: jest.fn().mockResolvedValue(SAMPLE_WO_ROW),
        update: jest
          .fn()
          .mockResolvedValue({ ...SAMPLE_WO_ROW, status: 'RECEBIDO' }),
        findUnique: jest.fn().mockResolvedValue(SAMPLE_WO_ROW),
        findMany: jest.fn().mockResolvedValue([SAMPLE_WO_ROW]),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([SAMPLE_ORDER_ROW]),
        count: jest.fn().mockResolvedValue(1),
      },
      ...overrides,
    };
    const sut = new PrismaLabRepository(prismaMock as any);
    return { sut, prismaMock };
  }

  it('create persiste OS de laboratório', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.create({
      id: 'wo-1',
      orderId: 'order-1',
      orderNumber: 'ORD-2026-0001',
      clientName: 'João Silva',
      productId: 'p-1',
      productName: 'Pós-larva',
      quantity: 10,
      unit: 'MILHEIRO',
      createdById: 'user-1',
    });

    expect(result.id).toBe('wo-1');
    expect(prismaMock.labWorkOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          productId: 'p-1',
          status: 'AGUARDANDO_LABORATORIO',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updateStatus registra responsável e horário', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.updateStatus('wo-1', {
      status: 'RECEBIDO',
      statusChangedBy: 'user-1',
      statusChangedAt: new Date('2026-09-20'),
    });

    expect(result.status).toBe('RECEBIDO');
    expect(prismaMock.labWorkOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wo-1' },
        data: expect.objectContaining({
          status: 'RECEBIDO',
          statusChangedBy: 'user-1',
        }),
      }),
    );
  });

  it('findById retorna OS hidratada', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.findById('wo-1');
    expect(result?.id).toBe('wo-1');
    expect(result?.productName).toBe('Pós-larva');
    expect(prismaMock.labWorkOrder.findUnique).toHaveBeenCalledWith({
      where: { id: 'wo-1' },
    });
  });

  it('findByOrderId retorna lista de OS do pedido', async () => {
    const { sut } = makeSut();

    const result = await sut.findByOrderId('order-1');
    expect(result).toHaveLength(1);
  });

  it('hasActiveForOrder retorna true se existir OS não cancelada', async () => {
    const { sut, prismaMock } = makeSut();
    const active = await sut.hasActiveForOrder('order-1');
    expect(active).toBe(true);
    expect(prismaMock.labWorkOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: 'order-1', status: { not: 'CANCELADO' } },
      }),
    );
  });

  it('hasActiveForOrder retorna false sem OS', async () => {
    const { sut } = makeSut({
      labWorkOrder: {
        create: jest.fn().mockResolvedValue(SAMPLE_WO_ROW),
        update: jest.fn().mockResolvedValue(SAMPLE_WO_ROW),
        findUnique: jest.fn().mockResolvedValue(SAMPLE_WO_ROW),
        findMany: jest.fn().mockResolvedValue([]),
      },
    });
    const active = await sut.hasActiveForOrder('order-1');
    expect(active).toBe(false);
  });

  it('listLabOrders retorna pedidos fechados paginados', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.listLabOrders({
      page: 1,
      limit: 20,
      search: 'João',
    });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        where: expect.objectContaining({
          deletedAt: null,
          operationalStatus: 'FECHADO',
          OR: expect.any(Array),
        }),
      }),
    );
  });
});
