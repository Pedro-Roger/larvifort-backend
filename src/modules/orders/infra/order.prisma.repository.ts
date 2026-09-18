import { Inject, Injectable } from '@nestjs/common';
import type { Paginated } from '../../../core/common/pagination';
import type {
  Order,
  OrderCustomerEvent,
  OrderCustomerEventType,
  OrderItem,
  OrderItemType,
  OrderOperationalStatus,
  OrderPhase,
  OrderStats,
  OrderStatus,
  OrderTask,
} from '../domain/order';
import type {
  CreateOrderInput,
  FindOrdersFilter,
  OrderRepositoryPort,
  UpdateOrderInput,
} from '../application/ports/order-repository.port';

export const PRISMA_ORDERS_TOKEN = 'PRISMA_ORDERS_TOKEN';

interface ItemRow {
  id: string;
  orderId: string;
  productId?: string | null;
  productCode?: string | null;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string | null;
  type: OrderItemType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

interface OrderTaskRow {
  id: string;
  orderId: string;
  taskId: string;
  relationshipType: string;
  autoCreated: boolean;
  notes?: string | null;
  createdAt: Date;
  task?: {
    titulo: string;
    status: string;
  } | null;
}

interface OrderCustomerEventRow {
  id: string;
  orderId: string;
  type: string;
  note: string | null;
  createdById: string | null;
  createdAt: Date;
}

interface OrderRow {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  phase: OrderPhase;
  operationalStatus: OrderOperationalStatus;
  clientId: string;
  companyId?: string | null;
  projectId?: string | null;
  salesRepUserId?: string | null;
  creatorId?: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string | null;
  paymentCondition?: string | null;
  paymentDate?: Date | null;
  shippingMethod?: string | null;
  trackingCode?: string | null;
  deliveryInstructions?: string | null;
  deliveryShift?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  closedAt?: Date | null;
  closedBy?: string | null;
  customerConfirmedBy?: string | null;
  customerConfirmedAt?: Date | null;
  customerConfirmationNote?: string | null;
  orderDate: Date;
  shippingDate?: Date | null;
  deliveryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  client?: {
    firstName: string;
    lastName: string;
    cpfCnpj?: string | null;
  } | null;
  company?: {
    name: string;
  } | null;
  project?: {
    name: string;
  } | null;
  salesRepUser?: {
    firstName: string;
    lastName: string;
  } | null;
  creator?: {
    firstName: string;
    lastName: string;
  } | null;
  items?: ItemRow[];
  tasks?: OrderTaskRow[];
  customerEvents?: Array<{
    id: string;
    orderId: string;
    type: string;
    note: string | null;
    createdById: string | null;
    createdAt: Date;
  }>;
}

interface PrismaOrderCrud {
  order: {
    findMany(args: Record<string, unknown>): Promise<OrderRow[]>;
    count(args?: Record<string, unknown>): Promise<number>;
    findUnique(args: {
      where: { id?: string; orderNumber?: string };
      select: Record<string, unknown>;
    }): Promise<OrderRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<OrderRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<OrderRow>;
    groupBy?(
      args: Record<string, unknown>,
    ): Promise<Array<Record<string, unknown>>>;
  };
  orderItem?: {
    deleteMany(args: { where: { orderId: string } }): Promise<unknown>;
  };
  orderTask?: {
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
  };
  orderCustomerEvent?: {
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
    findMany(args: {
      where: Record<string, unknown>;
    }): Promise<OrderCustomerEventRow[]>;
  };
}

const ORDER_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  phase: true,
  operationalStatus: true,
  clientId: true,
  companyId: true,
  projectId: true,
  salesRepUserId: true,
  creatorId: true,
  subtotal: true,
  discount: true,
  shippingCost: true,
  taxAmount: true,
  totalAmount: true,
  paymentMethod: true,
  paymentCondition: true,
  paymentDate: true,
  shippingMethod: true,
  trackingCode: true,
  deliveryInstructions: true,
  deliveryShift: true,
  shippingAddress: true,
  billingAddress: true,
  notes: true,
  cancellationReason: true,
  cancelledAt: true,
  closedAt: true,
  closedBy: true,
  customerConfirmedBy: true,
  customerConfirmedAt: true,
  customerConfirmationNote: true,
  orderDate: true,
  shippingDate: true,
  deliveryDate: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  client: {
    select: { firstName: true, lastName: true, cpfCnpj: true },
  },
  company: {
    select: { name: true },
  },
  project: {
    select: { name: true },
  },
  salesRepUser: {
    select: { firstName: true, lastName: true },
  },
  creator: {
    select: { firstName: true, lastName: true },
  },
  items: {
    where: { deletedAt: null },
    select: {
      id: true,
      orderId: true,
      productId: true,
      productCode: true,
      productName: true,
      unit: true,
      quantity: true,
      unitPrice: true,
      discount: true,
      totalPrice: true,
      notes: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  },
  tasks: {
    select: {
      id: true,
      orderId: true,
      taskId: true,
      relationshipType: true,
      autoCreated: true,
      notes: true,
      createdAt: true,
      task: {
        select: { titulo: true, status: true },
      },
    },
  },
  customerEvents: {
    select: {
      id: true,
      orderId: true,
      type: true,
      note: true,
      createdById: true,
      createdAt: true,
    },
  },
} as const;

@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(
    @Inject(PRISMA_ORDERS_TOKEN)
    private readonly prisma: PrismaOrderCrud,
  ) {}

  async create(data: CreateOrderInput): Promise<Order> {
    const itemsData = data.items.map((item) => {
      const discount = item.discount || 0;
      const totalPrice =
        item.totalPrice !== undefined
          ? item.totalPrice
          : Math.max(0, item.quantity * item.unitPrice - discount);
      return {
        productId: item.productId?.trim() || null,
        productCode: item.productCode?.trim() || null,
        productName: item.productName.trim(),
        unit: item.unit?.trim() || 'MILHEIRO',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount,
        totalPrice,
        notes: item.notes?.trim() || null,
        type: item.type || 'PRODUCT',
      };
    });

    const subtotal = itemsData.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = data.discount || 0;
    const shippingCost = data.shippingCost || 0;
    const taxAmount = data.taxAmount || 0;
    const totalAmount = Math.max(
      0,
      subtotal - discount + shippingCost + taxAmount,
    );

    const row = await this.prisma.order.create({
      data: {
        orderNumber: data.orderNumber?.trim() || null,
        status: data.status || 'PEDIDO',
        phase: data.phase || 'ABERTO',
        operationalStatus: data.operationalStatus || 'RASCUNHO',
        clientId: data.clientId.trim(),
        companyId: data.companyId?.trim() || null,
        projectId: data.projectId?.trim() || null,
        salesRepUserId: data.salesRepUserId?.trim() || null,
        creatorId: data.creatorId?.trim() || null,
        subtotal,
        discount,
        shippingCost,
        taxAmount,
        totalAmount,
        paymentMethod: data.paymentMethod?.trim() || null,
        paymentCondition: data.paymentCondition?.trim() || null,
        paymentDate: data.paymentDate || null,
        shippingMethod: data.shippingMethod?.trim() || null,
        trackingCode: data.trackingCode?.trim() || null,
        deliveryInstructions: data.deliveryInstructions?.trim() || null,
        deliveryShift: data.deliveryShift?.trim() || null,
        shippingAddress: data.shippingAddress || {},
        billingAddress: data.billingAddress || {},
        notes: data.notes?.trim() || null,
        customerConfirmedBy: data.customerConfirmedBy?.trim() || null,
        customerConfirmedAt: data.customerConfirmedAt || null,
        customerConfirmationNote: data.customerConfirmationNote?.trim() || null,
        orderDate: data.orderDate || new Date(),
        shippingDate: data.shippingDate || null,
        deliveryDate: data.deliveryDate || null,
        items: {
          create: itemsData,
        },
      },
      select: ORDER_SELECT,
    });

    if (data.linkTaskId && this.prisma.orderTask) {
      try {
        await this.prisma.orderTask.create({
          data: {
            orderId: row.id,
            taskId: data.linkTaskId.trim(),
            relationshipType: 'PRODUCT',
            autoCreated: true,
          },
        });
      } catch {
        // Ignora duplicata de vínculo
      }
    }

    return this.toDomain(row);
  }

  async update(id: string, data: UpdateOrderInput): Promise<Order> {
    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.phase !== undefined) updateData.phase = data.phase;
    if (data.operationalStatus !== undefined)
      updateData.operationalStatus = data.operationalStatus;
    if (data.clientId !== undefined) updateData.clientId = data.clientId.trim();
    if (data.companyId !== undefined)
      updateData.companyId = data.companyId?.trim() || null;
    if (data.projectId !== undefined)
      updateData.projectId = data.projectId?.trim() || null;
    if (data.salesRepUserId !== undefined)
      updateData.salesRepUserId = data.salesRepUserId?.trim() || null;
    if (data.paymentMethod !== undefined)
      updateData.paymentMethod = data.paymentMethod?.trim() || null;
    if (data.paymentCondition !== undefined)
      updateData.paymentCondition = data.paymentCondition?.trim() || null;
    if (data.paymentDate !== undefined)
      updateData.paymentDate = data.paymentDate;
    if (data.shippingMethod !== undefined)
      updateData.shippingMethod = data.shippingMethod?.trim() || null;
    if (data.trackingCode !== undefined)
      updateData.trackingCode = data.trackingCode?.trim() || null;
    if (data.deliveryInstructions !== undefined)
      updateData.deliveryInstructions =
        data.deliveryInstructions?.trim() || null;
    if (data.deliveryShift !== undefined)
      updateData.deliveryShift = data.deliveryShift?.trim() || null;
    if (data.shippingAddress !== undefined)
      updateData.shippingAddress = data.shippingAddress;
    if (data.billingAddress !== undefined)
      updateData.billingAddress = data.billingAddress;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (data.customerConfirmedBy !== undefined)
      updateData.customerConfirmedBy = data.customerConfirmedBy?.trim() || null;
    if (data.customerConfirmedAt !== undefined)
      updateData.customerConfirmedAt = data.customerConfirmedAt;
    if (data.customerConfirmationNote !== undefined)
      updateData.customerConfirmationNote =
        data.customerConfirmationNote?.trim() || null;
    if (data.orderDate !== undefined) updateData.orderDate = data.orderDate;
    if (data.shippingDate !== undefined)
      updateData.shippingDate = data.shippingDate;
    if (data.deliveryDate !== undefined)
      updateData.deliveryDate = data.deliveryDate;

    if (data.items) {
      if (this.prisma.orderItem) {
        await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
      }
      const itemsData = data.items.map((item) => {
        const discount = item.discount || 0;
        const totalPrice =
          item.totalPrice !== undefined
            ? item.totalPrice
            : Math.max(0, item.quantity * item.unitPrice - discount);
        return {
          productId: item.productId?.trim() || null,
          productCode: item.productCode?.trim() || null,
          productName: item.productName.trim(),
          unit: item.unit?.trim() || 'MILHEIRO',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount,
          totalPrice,
          notes: item.notes?.trim() || null,
          type: item.type || 'PRODUCT',
        };
      });

      const subtotal = itemsData.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
      const discount = data.discount !== undefined ? data.discount : 0;
      const shippingCost =
        data.shippingCost !== undefined ? data.shippingCost : 0;
      const taxAmount = data.taxAmount !== undefined ? data.taxAmount : 0;
      const totalAmount = Math.max(
        0,
        subtotal - discount + shippingCost + taxAmount,
      );

      updateData.subtotal = subtotal;
      updateData.discount = discount;
      updateData.shippingCost = shippingCost;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = totalAmount;
      updateData.items = { create: itemsData };
    } else {
      if (data.discount !== undefined) updateData.discount = data.discount;
      if (data.shippingCost !== undefined)
        updateData.shippingCost = data.shippingCost;
      if (data.taxAmount !== undefined) updateData.taxAmount = data.taxAmount;
    }

    const row = await this.prisma.order.update({
      where: { id },
      data: updateData,
      select: ORDER_SELECT,
    });

    return this.toDomain(row);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      select: ORDER_SELECT,
    });
    return row && !row.deletedAt ? this.toDomain(row) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: ORDER_SELECT,
    });
    return row && !row.deletedAt ? this.toDomain(row) : null;
  }

  async findMany(filter: FindOrdersFilter): Promise<Paginated<Order>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filter.status) where.status = filter.status;
    if (filter.phase) where.phase = filter.phase;
    if (filter.clientId) where.clientId = filter.clientId;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.salesRepUserId) where.salesRepUserId = filter.salesRepUserId;

    if (filter.de || filter.ate) {
      where.orderDate = {
        ...(filter.de ? { gte: filter.de } : {}),
        ...(filter.ate ? { lte: filter.ate } : {}),
      };
    }

    if (filter.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { client: { firstName: { contains: q, mode: 'insensitive' } } },
        { client: { lastName: { contains: q, mode: 'insensitive' } } },
        { client: { cpfCnpj: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        select: ORDER_SELECT,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async cancel(id: string, reason: string, cancelledAt: Date): Promise<Order> {
    const row = await this.prisma.order.update({
      where: { id },
      data: {
        phase: 'CANCELLED',
        operationalStatus: 'CANCELADO',
        cancellationReason: reason,
        cancelledAt,
      },
      select: ORDER_SELECT,
    });
    return this.toDomain(row);
  }

  async close(id: string, closedBy: string, closedAt: Date): Promise<Order> {
    const row = await this.prisma.order.update({
      where: { id },
      data: {
        operationalStatus: 'FECHADO',
        closedAt,
        closedBy,
      },
      select: ORDER_SELECT,
    });
    return this.toDomain(row);
  }

  async createCustomerEvent(data: {
    id: string;
    orderId: string;
    type: OrderCustomerEventType;
    note?: string | null;
    createdById?: string | null;
  }): Promise<OrderCustomerEvent> {
    await this.prisma.orderCustomerEvent!.create({
      data: {
        id: data.id,
        orderId: data.orderId,
        type: data.type,
        note: data.note ?? null,
        createdById: data.createdById ?? null,
      },
    });
    return {
      id: data.id,
      orderId: data.orderId,
      type: data.type,
      note: data.note ?? null,
      createdById: data.createdById ?? null,
      createdAt: new Date(),
    };
  }

  async listCustomerEvents(orderId: string): Promise<OrderCustomerEvent[]> {
    if (!this.prisma.orderCustomerEvent) return [];
    const rows = await this.prisma.orderCustomerEvent.findMany({
      where: { orderId },
    });
    return rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      type: r.type as OrderCustomerEventType,
      note: r.note ?? null,
      createdById: r.createdById ?? null,
      createdAt: r.createdAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async getStats(filter?: Partial<FindOrdersFilter>): Promise<OrderStats> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filter?.clientId) where.clientId = filter.clientId;
    if (filter?.projectId) where.projectId = filter.projectId;
    if (filter?.salesRepUserId) where.salesRepUserId = filter.salesRepUserId;

    const rows = await this.prisma.order.findMany({
      where,
      select: {
        status: true,
        phase: true,
        totalAmount: true,
      },
    });

    let totalOrcamentos = 0;
    let totalPedidos = 0;
    let totalCancelled = 0;
    let totalRevenue = 0;
    let revenueCount = 0;
    const phaseCounts: Record<string, number> = {
      DRAFT: 0,
      ABERTO: 0,
      PENDING: 0,
      APROVADO: 0,
      FATURADO: 0,
      ENTREGUE: 0,
      CANCELLED: 0,
    };

    for (const r of rows) {
      if (r.status === 'ORCAMENTO') totalOrcamentos++;
      if (r.status === 'PEDIDO') totalPedidos++;
      if (r.phase === 'CANCELLED') {
        totalCancelled++;
      } else {
        totalRevenue += r.totalAmount || 0;
        revenueCount++;
      }
      const p = r.phase || 'ABERTO';
      phaseCounts[p] = (phaseCounts[p] || 0) + 1;
    }

    const averageTicket = revenueCount > 0 ? totalRevenue / revenueCount : 0;

    return {
      totalOrders: rows.length,
      totalOrcamentos,
      totalPedidos,
      totalCancelled,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      phaseCounts,
    };
  }

  async generateNextOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count();
    return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private toDomain(row: OrderRow): Order {
    const clientName = row.client
      ? `${row.client.firstName} ${row.client.lastName}`.trim()
      : null;
    const salesRepName = row.salesRepUser
      ? `${row.salesRepUser.firstName} ${row.salesRepUser.lastName}`.trim()
      : null;
    const creatorName = row.creator
      ? `${row.creator.firstName} ${row.creator.lastName}`.trim()
      : null;

    const items: OrderItem[] = (row.items || []).map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId ?? null,
      productCode: item.productCode ?? null,
      productName: item.productName,
      unit: item.unit || 'MILHEIRO',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      totalPrice: item.totalPrice,
      notes: item.notes ?? null,
      type: item.type || 'PRODUCT',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt ?? null,
    }));

    const tasks: OrderTask[] = (row.tasks || []).map((t) => ({
      id: t.id,
      orderId: t.orderId,
      taskId: t.taskId,
      taskTitle: t.task?.titulo ?? null,
      taskStatus: t.task?.status ?? null,
      relationshipType: t.relationshipType,
      autoCreated: t.autoCreated,
      notes: t.notes ?? null,
      createdAt: t.createdAt,
    }));

    const customerEvents: OrderCustomerEvent[] = (row.customerEvents || []).map(
      (e) => ({
        id: e.id,
        orderId: e.orderId,
        type: e.type as OrderCustomerEventType,
        note: e.note ?? null,
        createdById: e.createdById ?? null,
        createdAt: e.createdAt,
      }),
    );

    return {
      id: row.id,
      orderNumber: row.orderNumber ?? null,
      status: row.status,
      phase: row.phase,
      operationalStatus: row.operationalStatus ?? 'RASCUNHO',
      clientId: row.clientId,
      clientName,
      clientCpfCnpj: row.client?.cpfCnpj ?? null,
      companyId: row.companyId ?? null,
      companyName: row.company?.name ?? null,
      projectId: row.projectId ?? null,
      projectName: row.project?.name ?? null,
      salesRepUserId: row.salesRepUserId ?? null,
      salesRepName,
      creatorId: row.creatorId ?? null,
      creatorName,
      subtotal: row.subtotal,
      discount: row.discount,
      shippingCost: row.shippingCost,
      taxAmount: row.taxAmount,
      totalAmount: row.totalAmount,
      paymentMethod: row.paymentMethod ?? null,
      paymentCondition: row.paymentCondition ?? null,
      paymentDate: row.paymentDate ?? null,
      shippingMethod: row.shippingMethod ?? null,
      trackingCode: row.trackingCode ?? null,
      deliveryInstructions: row.deliveryInstructions ?? null,
      deliveryShift: row.deliveryShift ?? null,
      shippingAddress: row.shippingAddress ?? null,
      billingAddress: row.billingAddress ?? null,
      notes: row.notes ?? null,
      cancellationReason: row.cancellationReason ?? null,
      cancelledAt: row.cancelledAt ?? null,
      closedAt: row.closedAt ?? null,
      closedBy: row.closedBy ?? null,
      customerConfirmedBy: row.customerConfirmedBy ?? null,
      customerConfirmedAt: row.customerConfirmedAt ?? null,
      customerConfirmationNote: row.customerConfirmationNote ?? null,
      orderDate: row.orderDate,
      shippingDate: row.shippingDate ?? null,
      deliveryDate: row.deliveryDate ?? null,
      items,
      tasks,
      customerEvents,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  }
}
