import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { CreateProductUseCase } from '../application/create-product.usecase';
import {
  UpdateProductUseCase,
  UpdateProductData,
} from '../application/update-product.usecase';
import { GetProductByIdUseCase } from '../application/get-product-by-id.usecase';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from '../application/ports/product-repository.port';
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

describe('ProductsController', () => {
  async function makeSut() {
    const createUseCase = {
      execute: jest
        .fn<Promise<Product>, [CreateProductDto]>()
        .mockResolvedValue(SAMPLE_PRODUCT),
    };
    const updateUseCase = {
      execute: jest
        .fn<Promise<Product>, [string, UpdateProductData]>()
        .mockResolvedValue(SAMPLE_PRODUCT),
    };
    const getByIdUseCase = {
      execute: jest
        .fn<Promise<Product>, [string]>()
        .mockResolvedValue(SAMPLE_PRODUCT),
    };
    const repository: Pick<ProductRepositoryPort, 'findAll'> = {
      findAll: jest
        .fn<Promise<Product[]>, []>()
        .mockResolvedValue([SAMPLE_PRODUCT]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: CreateProductUseCase, useValue: createUseCase },
        { provide: UpdateProductUseCase, useValue: updateUseCase },
        { provide: GetProductByIdUseCase, useValue: getByIdUseCase },
        { provide: PRODUCT_REPOSITORY_PORT, useValue: repository },
      ],
    }).compile();

    return {
      controller: module.get<ProductsController>(ProductsController),
      createUseCase,
      updateUseCase,
      getByIdUseCase,
      repository,
    };
  }

  it('deve criar um produto via POST /', async () => {
    const sut = await makeSut();
    const result = await sut.controller.create({
      code: 'PL-001',
      name: 'Pós-larva',
      unit: 'MILHEIRO',
    });
    expect(sut.createUseCase.execute).toHaveBeenCalled();
    expect(result.id).toBe('p1');
  });

  it('deve listar produtos via GET /', async () => {
    const sut = await makeSut();
    const result = await sut.controller.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('deve buscar um produto via GET /:id', async () => {
    const sut = await makeSut();
    const result = await sut.controller.findById('p1');
    expect(sut.getByIdUseCase.execute).toHaveBeenCalledWith('p1');
    expect(result.id).toBe('p1');
  });

  it('deve atualizar um produto via PATCH /:id', async () => {
    const sut = await makeSut();
    const result = await sut.controller.update('p1', { price: 200 });
    expect(sut.updateUseCase.execute).toHaveBeenCalledWith('p1', {
      price: 200,
    });
    expect(result.price).toBe(150);
  });
});

import type { CreateProductDto } from './dto/create-product.dto';
