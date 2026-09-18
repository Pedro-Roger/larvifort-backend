import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../domain/product';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from './ports/product-repository.port';

export interface UpdateProductData {
  code?: string;
  name?: string;
  unit?: string;
  price?: number | null;
  isActive?: boolean;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly repository: ProductRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateProductData): Promise<Product> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Produto não encontrado.');
    }

    if (input.code !== undefined && input.code !== null) {
      const code = input.code.trim();
      if (code && code !== existing.code) {
        const provider = await this.repository.findByCode(code);
        if (provider && provider.id !== id) {
          throw new ConflictException('Já existe produto com esse código.');
        }
      }
    }

    const data: UpdateProductData = { ...input };
    if (input.code !== undefined && input.code !== null) {
      data.code = input.code.trim();
    }
    if (input.price === null) {
      data.price = null;
    }

    return this.repository.update(id, data);
  }
}
