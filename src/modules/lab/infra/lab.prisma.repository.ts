import { Inject, Injectable } from '@nestjs/common';
import type { Paginated } from '../../../core/common/pagination';
import type {
  LabOrderItem,
  LabOrderRow,
  LabWorkOrder,
  LabWorkOrderStatus,
} from '../domain/lab-work-order';
import type {
  CreateLabWorkOrderInput,
  LabRepositoryPort,
  ListLabOrdersFilter,
  UpdateLabWorkOrderStatusInput,
} from '../application/ports/lab-repository.port';

export const PRISMA_LAB_TOKEN = 'PRISMA_LAB_TOKEN';

interface LabWorkOrderRow {
  id: string;
  orderId: string;
  orderNumber: string | null;
  clientName: string | null;
  productId: string | null;
  productName: string;
  quantity: number;
  unit: string;
  stockUnitId: string | null;
  stockUnitName: string | null;
  stockLocationId: string | null;
  stockLocationName: string | null;
  deliveryDate: Date | null;
  status: string;
  statusChangedBy: string | null;
  statusChangedAt: Date | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LabOrderRowRow {
  id: string;
  orderNumber: string | null;
  clientId: string;
  operationalStatus: string;
  deliveryDate: Date | null;
  client?: { firstName: string; lastName: string } | null;
  items?: Array<{
    id: string;
    productId?: string | null;
    productName: string;
    unit: string;
    quantity: number;
    deletedAt?: Date | null;
  }>;
}

interface PrismaLabCrud {
  labWorkOrder?: {
    create(args: { data: Record<string, unknown> }): Promise<LabWorkOrderRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<LabWorkOrderRow>;
    findUnique(args: {
      where: { id: string };
    }): Promise<LabWorkOrderRow | null>;
    findMany(args: Record<string, unknown>): Promise<LabWorkOrderRow[]>;
    count(args?: Record<string, unknown>): Promise<number>;
  };
  order?: {
    findMany(args: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
      select: Record<string, unknown>;
    }): Promise<LabOrderRowRow[]>;
    count(args?: Record<string, unknown>): Promise<number>;
  };
}

@Injectable()
export class PrismaLabRepository implements LabRepositoryPort {
  constructor(
    @Inject(PRISMA_LAB_TOKEN)
    private readonly prisma: PrismaLabCrud,
  ) {}

  async create(data: CreateLabWorkOrderInput): Promise<LabWorkOrder> {
    const row = await this.prisma.labWorkOrder!.create({
      data: {
        id: data.id,
        orderId: data.orderId,
        orderNumber: data.orderNumber ?? null,
        clientName: data.clientName ?? null,
        productId: data.productId ?? null,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit || 'MILHEIRO',
        stockUnitId: data.stockUnitId ?? null,
        stockUnitName: data.stockUnitName ?? null,
        stockLocationId: data.stockLocationId ?? null,
        stockLocationName: data.stockLocationName ?? null,
        deliveryDate: data.deliveryDate ?? null,
        status: 'AGUARDANDO_LABORATORIO',
        statusChangedBy: null,
        statusChangedAt: null,
        createdById: data.createdById ?? null,
      },
    });
    return this.toDomain(row);
  }

  async updateStatus(
    id: string,
    data: UpdateLabWorkOrderStatusInput,
  ): Promise<LabWorkOrder> {
    const row = await this.prisma.labWorkOrder!.update({
      where: { id },
      data: {
        status: data.status,
        statusChangedBy: data.statusChangedBy,
        statusChangedAt: data.statusChangedAt,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<LabWorkOrder | null> {
    const row = await this.prisma.labWorkOrder!.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<LabWorkOrder[]> {
    const rows = await this.prisma.labWorkOrder!.findMany({
      where: { orderId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async hasActiveForOrder(orderId: string): Promise<boolean> {
    const rows = await this.prisma.labWorkOrder!.findMany({
      where: {
        orderId,
        status: { not: 'CANCELADO' },
      },
    });
    return rows.length > 0;
  }

  async listLabOrders(
    filter: ListLabOrdersFilter,
  ): Promise<Paginated<LabOrderRow>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
      operationalStatus: 'FECHADO',
    };

    if (filter.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { client: { firstName: { contains: q, mode: 'insensitive' } } },
        { client: { lastName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.order!.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          clientId: true,
          operationalStatus: true,
          deliveryDate: true,
          client: { select: { firstName: true, lastName: true } },
          items: {
            where: { deletedAt: null },
            select: {
              id: true,
              productId: true,
              productName: true,
              unit: true,
              quantity: true,
            },
          },
        },
      }),
      this.prisma.order!.count({ where }),
    ]);

    const data: LabOrderRow[] = rows.map((r) => {
      const clientName = r.client
        ? `${r.client.firstName} ${r.client.lastName}`.trim()
        : null;
      const items: LabOrderItem[] = (r.items || [])
        .filter((i) => !i.deletedAt)
        .map((i) => ({
          id: i.id,
          productId: i.productId ?? null,
          productName: i.productName,
          unit: i.unit || 'MILHEIRO',
          quantity: i.quantity,
        }));
      return {
        id: r.id,
        orderNumber: r.orderNumber ?? null,
        clientId: r.clientId,
        clientName,
        items,
        deliveryDate: r.deliveryDate ?? null,
        operationalStatus: r.operationalStatus,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private toDomain(row: LabWorkOrderRow): LabWorkOrder {
    return {
      id: row.id,
      orderId: row.orderId,
      orderNumber: row.orderNumber ?? null,
      clientName: row.clientName ?? null,
      productId: row.productId ?? null,
      productName: row.productName,
      quantity: row.quantity,
      unit: row.unit || 'MILHEIRO',
      stockUnitId: row.stockUnitId ?? null,
      stockUnitName: row.stockUnitName ?? null,
      stockLocationId: row.stockLocationId ?? null,
      stockLocationName: row.stockLocationName ?? null,
      deliveryDate: row.deliveryDate ?? null,
      status: row.status as LabWorkOrderStatus,
      statusChangedBy: row.statusChangedBy ?? null,
      statusChangedAt: row.statusChangedAt ?? null,
      createdById: row.createdById ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
