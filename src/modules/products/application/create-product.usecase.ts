import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Product } from '../domain/product';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from './ports/product-repository.port';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly repository: ProductRepositoryPort,
  ) {}

  async execute(data: {
    code: string;
    name: string;
    unit: string;
    price?: number | null;
  }): Promise<Product> {
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new ConflictException(`Produto com código ${data.code} já existe.`);
    }

    return this.repository.save({
      id: uuidv4(),
      code: data.code,
      name: data.name,
      unit: data.unit,
      price: data.price ?? null,
      isActive: true,
    });
  }
}
