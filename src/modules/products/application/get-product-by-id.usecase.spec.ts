import { NotFoundException } from '@nestjs/common';
import { GetProductByIdUseCase } from './get-product-by-id.usecase';
import type { ProductRepositoryPort } from './ports/product-repository.port';
import type { Product } from '../domain/product';

const SAMPLE_PRODUCT: Product = {
  id: 'p1',
  code: 'PL-001',
  name: 'Pós-larva',
  unit: 'MILHEIRO',
  price: 150,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GetProductByIdUseCase', () => {
  it('retorna produto quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_PRODUCT);
    const repository = { findById } as unknown as ProductRepositoryPort;
    const useCase = new GetProductByIdUseCase(repository);

    const result = await useCase.execute('p1');

    expect(findById).toHaveBeenCalledWith('p1');
    expect(result).toEqual(SAMPLE_PRODUCT);
  });

  it('lança 404 quando produto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const repository = { findById } as unknown as ProductRepositoryPort;
    const useCase = new GetProductByIdUseCase(repository);

    await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
  });
});
