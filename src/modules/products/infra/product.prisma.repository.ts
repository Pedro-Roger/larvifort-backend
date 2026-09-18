import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../domain/product';
import { ProductRepositoryPort } from '../application/ports/product-repository.port';

export const PRISMA_PRODUCTS_TOKEN = 'PRISMA_PRODUCTS_TOKEN';

interface ProductRow {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProductCrud {
  product: {
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProductRow>;
    findUnique(args: {
      where: { id?: string; code?: string };
      select: Record<string, true>;
    }): Promise<ProductRow | null>;
    findMany(args?: { select: Record<string, true> }): Promise<ProductRow[]>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProductRow>;
  };
}

const PRODUCT_SELECT = {
  id: true,
  code: true,
  name: true,
  unit: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(
    @Inject(PRISMA_PRODUCTS_TOKEN)
    private readonly prisma: PrismaProductCrud,
  ) {}

  async save(
    product: Omit<Product, 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const row = await this.prisma.product.create({
      data: {
        id: product.id,
        code: product.code,
        name: product.name,
        unit: product.unit,
        price: product.price,
        isActive: product.isActive,
      },
      select: PRODUCT_SELECT,
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { code },
      select: PRODUCT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({ select: PRODUCT_SELECT });
    return rows.map((r) => this.toDomain(r));
  }

  async update(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Product> {
    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.price !== undefined) {
      updateData.price = data.price === null ? null : data.price;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const row = await this.prisma.product.update({
      where: { id },
      data: updateData,
      select: PRODUCT_SELECT,
    });
    return this.toDomain(row);
  }

  private toDomain(row: ProductRow): Product {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      unit: row.unit,
      price: row.price,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
