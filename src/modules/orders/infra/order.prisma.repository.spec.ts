import {
  PRISMA_ORDERS_TOKEN,
  PrismaOrderRepository,
} from './order.prisma.repository';

describe('PrismaOrderRepository', () => {
  const SAMPLE_ORDER_ROW = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    clientId: 'client-1',
    companyId: 'comp-1',
    projectId: 'proj-1',
    salesRepUserId: 'user-1',
    creatorId: 'user-2',
    subtotal: 1000,
    discount: 50,
    shippingCost: 20,
    taxAmount: 0,
    totalAmount: 970,
    paymentMethod: 'PIX',
    paymentCondition: 'À vista',
    shippingMethod: 'Transportadora',
    trackingCode: 'TRACK123',
    deliveryInstructions: 'Entregar na portaria',
    shippingAddress: { rua: 'A' },
    billingAddress: { rua: 'A' },
    notes: 'Anotações do pedido',
    cancellationReason: null,
    cancelledAt: null,
    orderDate: new Date('2026-09-15'),
    shippingDate: null,
    deliveryDate: null,
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-15'),
    deletedAt: null,
    client: {
      firstName: 'Carlos',
      lastName: 'Silva',
      cpfCnpj: '12345678901',
    },
    company: { name: 'Empresa A' },
    project: { name: 'Pipeline Comercial' },
    salesRepUser: { firstName: 'Vendedor', lastName: '1' },
    creator: { firstName: 'Criador', lastName: '2' },
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        productCode: 'L-10',
        productName: 'Larva PL10',
        unit: 'MILHEIRO',
        quantity: 10,
        unitPrice: 100,
        discount: 0,
        totalPrice: 1000,
        notes: null,
        type: 'PRODUCT',
        createdAt: new Date('2026-09-15'),
        updatedAt: new Date('2026-09-15'),
        deletedAt: null,
      },
    ],
    tasks: [],
  };

  function makeSut(prismaMockOverrides?: Record<string, unknown>) {
    const prismaMock = {
      order: {
        findMany: jest.fn().mockResolvedValue([SAMPLE_ORDER_ROW]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(SAMPLE_ORDER_ROW),
        create: jest.fn().mockResolvedValue(SAMPLE_ORDER_ROW),
        update: jest.fn().mockResolvedValue(SAMPLE_ORDER_ROW),
      },
      orderItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      orderTask: {
        create: jest.fn().mockResolvedValue({ id: 'ot-1' }),
      },
      ...prismaMockOverrides,
    };

    const sut = new PrismaOrderRepository(prismaMock as never);
    return { sut, prismaMock };
  }

  it('create persiste pedido, itens e calcula totais', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.create({
      clientId: 'client-1',
      orderNumber: 'ORD-2026-0001',
      discount: 50,
      shippingCost: 20,
      items: [
        {
          productName: 'Larva PL10',
          quantity: 10,
          unitPrice: 100,
          discount: 0,
        },
      ],
      linkTaskId: 'task-1',
    });

    expect(result.id).toBe('order-1');
    expect(result.totalAmount).toBe(970);
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientId: 'client-1',
          subtotal: 1000,
          totalAmount: 970,
        }),
      }),
    );
    expect(prismaMock.orderTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          taskId: 'task-1',
        }),
      }),
    );
  });

  it('findById retorna pedido hidratado', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.findById('order-1');
    expect(result?.id).toBe('order-1');
    expect(result?.clientName).toBe('Carlos Silva');
    expect(result?.items).toHaveLength(1);
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-1' } }),
    );
  });

  it('findByOrderNumber retorna pedido pelo número', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.findByOrderNumber('ORD-2026-0001');
    expect(result?.orderNumber).toBe('ORD-2026-0001');
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orderNumber: 'ORD-2026-0001' } }),
    );
  });

  it('findMany aplica filtros e retorna paginação', async () => {
    const { sut, prismaMock } = makeSut();

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      status: 'PEDIDO',
      search: 'Carlos',
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          status: 'PEDIDO',
          deletedAt: null,
        }),
      }),
    );
  });

  it('cancel atualiza fase para CANCELLED e motivo', async () => {
    const { sut, prismaMock } = makeSut();
    const cancelledRow = {
      ...SAMPLE_ORDER_ROW,
      phase: 'CANCELLED',
      cancellationReason: 'Desistiu',
      cancelledAt: new Date(),
    };
    prismaMock.order.update.mockResolvedValueOnce(cancelledRow);

    const result = await sut.cancel('order-1', 'Desistiu', new Date());
    expect(result.phase).toBe('CANCELLED');
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          phase: 'CANCELLED',
          cancellationReason: 'Desistiu',
        }),
      }),
    );
  });

  it('delete aplica soft delete (deletedAt)', async () => {
    const { sut, prismaMock } = makeSut();

    await sut.delete('order-1');
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('getStats agrega contagens e receita', async () => {
    const { sut, prismaMock } = makeSut({
      order: {
        findMany: jest.fn().mockResolvedValue([
          { status: 'PEDIDO', phase: 'APROVADO', totalAmount: 1000 },
          { status: 'ORCAMENTO', phase: 'ABERTO', totalAmount: 500 },
          { status: 'PEDIDO', phase: 'CANCELLED', totalAmount: 300 },
        ]),
      },
    });

    const stats = await sut.getStats();
    expect(stats.totalOrders).toBe(3);
    expect(stats.totalPedidos).toBe(2);
    expect(stats.totalOrcamentos).toBe(1);
    expect(stats.totalCancelled).toBe(1);
    expect(stats.totalRevenue).toBe(1500);
    expect(stats.averageTicket).toBe(750);
  });

  it('generateNextOrderNumber gera número formatado com ano', async () => {
    const { sut, prismaMock } = makeSut();
    prismaMock.order.count.mockResolvedValueOnce(4);

    const nextNumber = await sut.generateNextOrderNumber();
    const year = new Date().getFullYear();
    expect(nextNumber).toBe(`ORD-${year}-0005`);
  });
});
