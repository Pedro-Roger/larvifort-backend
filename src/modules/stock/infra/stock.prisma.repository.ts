import { Inject, Injectable } from '@nestjs/common';
import { StockLocation, TipoUbicacion } from '../domain/stock-location';
import { StatusStock, StockUnit } from '../domain/stock-unit';
import {
  FindStockLocationsFilter,
  StockRepositoryPort,
} from '../application/ports/stock-repository.port';

export const PRISMA_STOCK_TOKEN = 'PRISMA_STOCK_TOKEN';

interface StockUnitRow {
  id: string;
  name: string;
  city: string | null;
  status: StatusStock;
  createdAt: Date;
  updatedAt: Date;
}

interface StockLocationRow {
  id: string;
  name: string;
  unitId: string;
  type: TipoUbicacion;
  capacity: number | null;
  status: StatusStock;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaStockCrud {
  stockUnit: {
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<StockUnitRow>;
    findUnique(args: {
      where: { id?: string; name?: string };
      select: Record<string, true>;
    }): Promise<StockUnitRow | null>;
    findMany(args?: { select: Record<string, true> }): Promise<StockUnitRow[]>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<StockUnitRow>;
  };
  stockLocation: {
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<StockLocationRow>;
    findUnique(args: {
      where: { id: string };
      select: Record<string, true>;
    }): Promise<StockLocationRow | null>;
    findMany(args: {
      where: Record<string, unknown>;
      select: Record<string, true>;
      skip?: number;
      take?: number;
    }): Promise<StockLocationRow[]>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<StockLocationRow>;
  };
}

const STOCK_UNIT_SELECT = {
  id: true,
  name: true,
  city: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const STOCK_LOCATION_SELECT = {
  id: true,
  name: true,
  unitId: true,
  type: true,
  capacity: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaStockRepository implements StockRepositoryPort {
  constructor(
    @Inject(PRISMA_STOCK_TOKEN)
    private readonly prisma: PrismaStockCrud,
  ) {}

  // ---------- Unidades ----------
  async saveUnit(
    data: Omit<StockUnit, 'createdAt' | 'updatedAt'>,
  ): Promise<StockUnit> {
    const row = await this.prisma.stockUnit.create({
      data: {
        id: data.id,
        name: data.name,
        city: data.city,
        status: data.status,
      },
      select: STOCK_UNIT_SELECT,
    });
    return this.toUnitDomain(row);
  }

  async findUnitById(id: string): Promise<StockUnit | null> {
    const row = await this.prisma.stockUnit.findUnique({
      where: { id },
      select: STOCK_UNIT_SELECT,
    });
    return row ? this.toUnitDomain(row) : null;
  }

  async findUnitByName(name: string): Promise<StockUnit | null> {
    const row = await this.prisma.stockUnit.findUnique({
      where: { name },
      select: STOCK_UNIT_SELECT,
    });
    return row ? this.toUnitDomain(row) : null;
  }

  async listUnits(): Promise<StockUnit[]> {
    const rows = await this.prisma.stockUnit.findMany({
      select: STOCK_UNIT_SELECT,
    });
    return rows.map((r) => this.toUnitDomain(r));
  }

  async updateUnit(
    id: string,
    data: Partial<Omit<StockUnit, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<StockUnit> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.status !== undefined) updateData.status = data.status;

    const row = await this.prisma.stockUnit.update({
      where: { id },
      data: updateData,
      select: STOCK_UNIT_SELECT,
    });
    return this.toUnitDomain(row);
  }

  // ---------- Locais / berçários ----------
  async saveLocation(
    data: Omit<StockLocation, 'createdAt' | 'updatedAt'>,
  ): Promise<StockLocation> {
    const row = await this.prisma.stockLocation.create({
      data: {
        id: data.id,
        name: data.name,
        unitId: data.unitId,
        type: data.type,
        capacity: data.capacity,
        status: data.status,
      },
      select: STOCK_LOCATION_SELECT,
    });
    return this.toLocationDomain(row);
  }

  async findLocationById(id: string): Promise<StockLocation | null> {
    const row = await this.prisma.stockLocation.findUnique({
      where: { id },
      select: STOCK_LOCATION_SELECT,
    });
    return row ? this.toLocationDomain(row) : null;
  }

  async listLocations(
    filter: FindStockLocationsFilter,
  ): Promise<StockLocation[]> {
    const where: Record<string, unknown> = {};
    if (filter.unitId !== undefined) where.unitId = filter.unitId;
    if (filter.type !== undefined) where.type = filter.type;

    const rows = await this.prisma.stockLocation.findMany({
      where,
      select: STOCK_LOCATION_SELECT,
      skip:
        (filter.page && filter.page > 1 ? filter.page - 1 : 0) *
        (filter.limit ?? 20),
      take: filter.limit ?? 20,
    });
    return rows.map((r) => this.toLocationDomain(r));
  }

  async updateLocation(
    id: string,
    data: Partial<Omit<StockLocation, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<StockLocation> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unitId !== undefined) updateData.unitId = data.unitId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.status !== undefined) updateData.status = data.status;

    const row = await this.prisma.stockLocation.update({
      where: { id },
      data: updateData,
      select: STOCK_LOCATION_SELECT,
    });
    return this.toLocationDomain(row);
  }

  private toUnitDomain(row: StockUnitRow): StockUnit {
    return {
      id: row.id,
      name: row.name,
      city: row.city,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toLocationDomain(row: StockLocationRow): StockLocation {
    return {
      id: row.id,
      name: row.name,
      unitId: row.unitId,
      type: row.type,
      capacity: row.capacity,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
