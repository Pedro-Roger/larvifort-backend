import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.usecase';
import type { ProductRepositoryPort } from './ports/product-repository.port';
import type { Product } from '../domain/product';

const BASE_PRODUCT: Product = {
  id: 'p1',
  code: 'PL-001',
  name: 'Pós-larva',
  unit: 'MILHEIRO',
  price: 100,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UpdateProductUseCase', () => {
  it('deve atualizar um produto existente', async () => {
    const findById = jest.fn().mockResolvedValue(BASE_PRODUCT);
    const update = jest.fn().mockResolvedValue({
      ...BASE_PRODUCT,
      name: 'Pós-larva Nova',
      price: 120,
    });
    const repository = {
      findById,
      findByCode: jest.fn(),
      update,
    } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    const result = await useCase.execute('p1', { price: 120 });

    expect(update).toHaveBeenCalledWith('p1', { price: 120 });
    expect(result.name).toBe('Pós-larva Nova');
  });

  it('deve lançar NotFoundException se produto não existir', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const repository = { findById } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    await expect(useCase.execute('ghost', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar ConflictException se código já existir em outro produto', async () => {
    const findById = jest.fn().mockResolvedValue(BASE_PRODUCT);
    const findByCode = jest.fn().mockResolvedValue({ id: 'p2' });
    const update = jest.fn();
    const repository = {
      findById,
      findByCode,
      update,
    } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    await expect(useCase.execute('p1', { code: 'PL-002' })).rejects.toThrow(
      ConflictException,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('deve permitir manter o próprio código sem conflito', async () => {
    const findById = jest.fn().mockResolvedValue(BASE_PRODUCT);
    const update = jest.fn().mockResolvedValue({
      ...BASE_PRODUCT,
      name: 'Matriz',
    });
    const repository = {
      findById,
      findByCode: jest.fn(),
      update,
    } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    const result = await useCase.execute('p1', { code: ' PL-001 ' });

    expect(result.code).toBe('PL-001');
    expect(result.name).toBe('Matriz');
  });

  it('deve desativar produto via isActive=false', async () => {
    const findById = jest.fn().mockResolvedValue(BASE_PRODUCT);
    const update = jest.fn().mockResolvedValue({
      ...BASE_PRODUCT,
      isActive: false,
    });
    const repository = {
      findById,
      findByCode: jest.fn(),
      update,
    } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    const result = await useCase.execute('p1', { isActive: false });

    expect(update).toHaveBeenCalledWith('p1', { isActive: false });
    expect(result.isActive).toBe(false);
  });

  it('deve permitir limpiar preço com null', async () => {
    const findById = jest.fn().mockResolvedValue(BASE_PRODUCT);
    const update = jest
      .fn()
      .mockResolvedValue({ ...BASE_PRODUCT, price: null });
    const repository = {
      findById,
      findByCode: jest.fn(),
      update,
    } as unknown as ProductRepositoryPort;
    const useCase = new UpdateProductUseCase(repository);

    const result = await useCase.execute('p1', { price: null });

    expect(update).toHaveBeenCalledWith('p1', { price: null });
    expect(result.price).toBeNull();
  });
});
