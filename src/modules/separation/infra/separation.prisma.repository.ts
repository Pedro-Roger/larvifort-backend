import { Inject, Injectable } from '@nestjs/common';
import type {
  OrderSeparation,
  SeparationStatus,
} from '../domain/order-separation';
import type {
  SeparationRepositoryPort,
  UpdateSeparationInput,
} from '../application/ports/separation-repository.port';

export const PRISMA_SEPARATION_TOKEN = 'PRISMA_SEPARATION_TOKEN';

interface OrderSeparationRow {
  id: string;
  orderId: string;
  status: SeparationStatus;
  startedAt: Date | null;
  startedBy: string | null;
  completedAt: Date | null;
  completedBy: string | null;
  divergenceNote: string | null;
  divergenceAt: Date | null;
  divergenceBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaSeparationCrud {
  orderSeparation?: {
    findUnique(args: {
      where: { orderId: string };
    }): Promise<OrderSeparationRow | null>;
    create(args: {
      data: Record<string, unknown>;
    }): Promise<OrderSeparationRow>;
    update(args: {
      where: { orderId: string };
      data: Record<string, unknown>;
    }): Promise<OrderSeparationRow>;
  };
}

@Injectable()
export class PrismaSeparationRepository implements SeparationRepositoryPort {
  constructor(
    @Inject(PRISMA_SEPARATION_TOKEN)
    private readonly prisma: PrismaSeparationCrud,
  ) {}

  async findByOrderId(orderId: string): Promise<OrderSeparation | null> {
    const row = await this.prisma.orderSeparation!.findUnique({
      where: { orderId },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(orderId: string): Promise<OrderSeparation> {
    const row = await this.prisma.orderSeparation!.create({
      data: { orderId },
    });
    return this.toDomain(row);
  }

  async update(
    orderId: string,
    data: UpdateSeparationInput,
  ): Promise<OrderSeparation> {
    const updateData: Record<string, unknown> = { ...data };
    const row = await this.prisma.orderSeparation!.update({
      where: { orderId },
      data: updateData,
    });
    return this.toDomain(row);
  }

  private toDomain(row: OrderSeparationRow): OrderSeparation {
    return {
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      startedAt: row.startedAt,
      startedBy: row.startedBy,
      completedAt: row.completedAt,
      completedBy: row.completedBy,
      divergenceNote: row.divergenceNote,
      divergenceAt: row.divergenceAt,
      divergenceBy: row.divergenceBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
