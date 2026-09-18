import { ConflictException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';
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

describe('CreateProductUseCase', () => {
  it('deve criar um produto', async () => {
    const findByCode = jest.fn().mockResolvedValue(null);
    const save = jest.fn().mockResolvedValue(SAMPLE_PRODUCT);
    const repository = { findByCode, save } as unknown as ProductRepositoryPort;
    const useCase = new CreateProductUseCase(repository);

    const result = await useCase.execute({
      code: 'PL-001',
      name: 'Pós-larva',
      unit: 'MILHEIRO',
    });

    expect(findByCode).toHaveBeenCalledWith('PL-001');
    expect(save).toHaveBeenCalled();
    expect(result.id).toBe('p1');
  });

  it('deve falhar se produto já existe', async () => {
    const findByCode = jest.fn().mockResolvedValue({ id: 'other-id' });
    const save = jest.fn();
    const repository = { findByCode, save } as unknown as ProductRepositoryPort;
    const useCase = new CreateProductUseCase(repository);

    await expect(
      useCase.execute({ code: 'PL-001', name: 'Pós-larva', unit: 'MILHEIRO' }),
    ).rejects.toThrow(ConflictException);
    expect(save).not.toHaveBeenCalled();
  });
});
