import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityRow } from '../domain/availability';
import { StockMovement, StockMovementType } from '../domain/stock-movement';
import {
  StockReservation,
  StockReservationStatus,
} from '../domain/stock-reservation';
import {
  AvailabilityFilter,
  FindMovementsFilter,
  RegisterMovementData,
  ReservationFilter,
  StockInventoryRepositoryPort,
} from '../application/ports/stock-inventory-repository.port';

export const PRISMA_STOCK_INVENTORY_TOKEN = 'PRISMA_STOCK_INVENTORY_TOKEN';

interface LevelRow {
  productId: string;
  stockLocationId: string;
  quantity: number;
  reserved: number;
}

interface MovementRow {
  id: string;
  productId: string;
  stockLocationId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  responsibleId: string | null;
  orderId: string | null;
  createdAt: Date;
}

interface ReservationRow {
  id: string;
  productId: string;
  stockLocationId: string;
  orderId: string | null;
  quantity: number;
  status: StockReservationStatus;
  responsibleId: string | null;
  createdAt: Date;
  cancelledAt: Date | null;
}

interface LocationRow {
  id: string;
  name: string;
  unitId: string;
}

interface UnitRow {
  id: string;
  name: string;
}

interface PrismaInventoryCrud {
  stockLevel: {
    findMany(args: { where: Record<string, unknown> }): Promise<LevelRow[]>;
    findUnique(args: {
      where: {
        productId_stockLocationId: {
          productId: string;
          stockLocationId: string;
        };
      };
    }): Promise<LevelRow | null>;
    upsert(args: {
      where: {
        productId_stockLocationId: {
          productId: string;
          stockLocationId: string;
        };
      };
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }): Promise<LevelRow>;
  };
  stockMovement: {
    create(args: { data: Record<string, unknown> }): Promise<MovementRow>;
    findMany(args: {
      where: Record<string, unknown>;
      orderBy?: Record<string, 'desc'>;
      skip?: number;
      take?: number;
    }): Promise<MovementRow[]>;
  };
  stockReservation: {
    create(args: { data: Record<string, unknown> }): Promise<ReservationRow>;
    findUnique(args: { where: { id: string } }): Promise<ReservationRow | null>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<ReservationRow>;
    findMany(args: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
    }): Promise<ReservationRow[]>;
  };
  stockLocation: {
    findMany(args: { where: Record<string, unknown> }): Promise<LocationRow[]>;
  };
  stockUnit: {
    findMany(args: { where: Record<string, unknown> }): Promise<UnitRow[]>;
  };
}

@Injectable()
export class PrismaStockInventoryRepository implements StockInventoryRepositoryPort {
  constructor(
    @Inject(PRISMA_STOCK_INVENTORY_TOKEN)
    private readonly prisma: PrismaInventoryCrud,
  ) {}

  async getAvailability(
    filter: AvailabilityFilter,
  ): Promise<AvailabilityRow[]> {
    const levelWhere: Record<string, unknown> = {};
    if (filter.productId !== undefined) levelWhere.productId = filter.productId;
    if (filter.locationId !== undefined)
      levelWhere.stockLocationId = filter.locationId;
    const levels = await this.prisma.stockLevel.findMany({
      where: levelWhere,
    });

    const locationWhere: Record<string, unknown> = {};
    if (filter.locationId !== undefined) locationWhere.id = filter.locationId;
    if (filter.unitId !== undefined) locationWhere.unitId = filter.unitId;
    const locations = await this.prisma.stockLocation.findMany({
      where: locationWhere,
    });
    const units = await this.prisma.stockUnit.findMany({ where: {} });

    const locationById = new Map(locations.map((l) => [l.id, l]));
    const unitById = new Map(units.map((u) => [u.id, u]));

    return levels
      .filter((l) => locationById.has(l.stockLocationId))
      .map((l) => {
        const loc = locationById.get(l.stockLocationId);
        const unit = loc ? unitById.get(loc.unitId) : null;
        return {
          productId: l.productId,
          stockLocationId: l.stockLocationId,
          unitId: loc ? loc.unitId : '',
          unitName: unit ? unit.name : '',
          locationName: loc ? loc.name : '',
          quantity: l.quantity,
          reserved: l.reserved,
          available: l.quantity - l.reserved,
        };
      });
  }

  async getLevel(
    productId: string,
    stockLocationId: string,
  ): Promise<{ quantity: number; reserved: number } | null> {
    const row = await this.prisma.stockLevel.findUnique({
      where: {
        productId_stockLocationId: { productId, stockLocationId },
      },
    });
    return row ? { quantity: row.quantity, reserved: row.reserved } : null;
  }

  async upsertLevel(
    productId: string,
    stockLocationId: string,
    quantity: number,
    reserved: number,
  ): Promise<void> {
    await this.prisma.stockLevel.upsert({
      where: {
        productId_stockLocationId: { productId, stockLocationId },
      },
      create: {
        productId,
        stockLocationId,
        quantity,
        reserved,
      },
      update: {
        quantity,
        reserved,
      },
    });
  }

  async registerMovement(data: RegisterMovementData): Promise<StockMovement> {
    const row = await this.prisma.stockMovement.create({
      data: {
        id: data.id,
        productId: data.productId,
        stockLocationId: data.stockLocationId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        responsibleId: data.responsibleId,
        orderId: data.orderId,
      },
    });
    return this.toMovementDomain(row);
  }

  async listMovements(filter: FindMovementsFilter): Promise<StockMovement[]> {
    const where: Record<string, unknown> = {};
    if (filter.productId !== undefined) where.productId = filter.productId;
    if (filter.locationId !== undefined)
      where.stockLocationId = filter.locationId;
    if (filter.orderId !== undefined) where.orderId = filter.orderId;
    if (filter.type !== undefined) where.type = filter.type;

    const skip =
      (filter.page && filter.page > 1 ? filter.page - 1 : 0) *
      (filter.limit ?? 20);
    const rows = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: filter.limit ?? 20,
    });
    return rows.map((r) => this.toMovementDomain(r));
  }

  async createReservation(data: {
    id: string;
    productId: string;
    stockLocationId: string;
    orderId?: string | null;
    quantity: number;
    responsibleId?: string | null;
  }): Promise<StockReservation> {
    const row = await this.prisma.stockReservation.create({
      data: {
        id: data.id,
        productId: data.productId,
        stockLocationId: data.stockLocationId,
        orderId: data.orderId,
        quantity: data.quantity,
        status: 'ACTIVA',
        responsibleId: data.responsibleId,
      },
    });
    return this.toReservationDomain(row);
  }

  async findReservationById(id: string): Promise<StockReservation | null> {
    const row = await this.prisma.stockReservation.findUnique({
      where: { id },
    });
    return row ? this.toReservationDomain(row) : null;
  }

  async cancelReservation(id: string): Promise<StockReservation> {
    const row = await this.prisma.stockReservation.update({
      where: { id },
      data: { status: 'CANCELADA', cancelledAt: new Date() },
    });
    return this.toReservationDomain(row);
  }

  async listReservations(
    filter: ReservationFilter,
  ): Promise<StockReservation[]> {
    const where: Record<string, unknown> = {};
    if (filter.productId !== undefined) where.productId = filter.productId;
    if (filter.orderId !== undefined) where.orderId = filter.orderId;
    if (filter.status !== undefined) where.status = filter.status;

    const skip =
      (filter.page && filter.page > 1 ? filter.page - 1 : 0) *
      (filter.limit ?? 20);
    const rows = await this.prisma.stockReservation.findMany({
      where,
      skip,
      take: filter.limit ?? 20,
    });
    return rows.map((r) => this.toReservationDomain(r));
  }

  private toMovementDomain(row: MovementRow): StockMovement {
    return {
      id: row.id,
      productId: row.productId,
      stockLocationId: row.stockLocationId,
      type: row.type,
      quantity: row.quantity,
      reason: row.reason,
      responsibleId: row.responsibleId,
      orderId: row.orderId,
      createdAt: row.createdAt,
    };
  }

  private toReservationDomain(row: ReservationRow): StockReservation {
    return {
      id: row.id,
      productId: row.productId,
      stockLocationId: row.stockLocationId,
      orderId: row.orderId,
      quantity: row.quantity,
      status: row.status,
      responsibleId: row.responsibleId,
      createdAt: row.createdAt,
      cancelledAt: row.cancelledAt,
    };
  }
}
