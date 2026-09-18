import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateProductUseCase } from '../application/create-product.usecase';
import { UpdateProductUseCase } from '../application/update-product.usecase';
import { GetProductByIdUseCase } from '../application/get-product-by-id.usecase';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { Product } from '../domain/product';
import {
  ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from '../application/ports/product-repository.port';

@ApiTags('Produtos')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly getProductById: GetProductByIdUseCase,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly repository: ProductRepositoryPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.createProduct.execute(dto);
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.repository.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product> {
    return this.getProductById.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.updateProduct.execute(id, dto);
  }
}
