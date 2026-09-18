import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateProductUseCase } from './application/create-product.usecase';
import { UpdateProductUseCase } from './application/update-product.usecase';
import { GetProductByIdUseCase } from './application/get-product-by-id.usecase';
import { PRODUCT_REPOSITORY_PORT } from './application/ports/product-repository.port';
import {
  PRISMA_PRODUCTS_TOKEN,
  PrismaProductRepository,
} from './infra/product.prisma.repository';
import { ProductsController } from './presentation/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductByIdUseCase,
    PrismaProductRepository,
    { provide: PRISMA_PRODUCTS_TOKEN, useExisting: PrismaService },
    { provide: PRODUCT_REPOSITORY_PORT, useClass: PrismaProductRepository },
  ],
  exports: [
    PRODUCT_REPOSITORY_PORT,
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductByIdUseCase,
  ],
})
export class ProductsModule {}
