import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from './ports/product-repository.port';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly repository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return product;
  }
}
