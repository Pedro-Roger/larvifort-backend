import { Product } from '../../domain/product';

export const PRODUCT_REPOSITORY_PORT = 'PRODUCT_REPOSITORY_PORT';

export interface ProductRepositoryPort {
  save(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByCode(code: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  update(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Product>;
}
