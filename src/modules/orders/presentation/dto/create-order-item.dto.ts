import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { OrderItemType } from '../../domain/order';

export class CreateOrderItemDto {
  @ApiPropertyOptional({
    example: 'prod-123',
    description: 'ID do produto no catálogo',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    example: 'L-10',
    description: 'Código de referência do produto',
  })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({
    example: 'Pós-larva de Camarão PL10',
    description: 'Nome/descrição do item',
  })
  @IsString({ message: 'Nome do produto é obrigatório.' })
  @IsNotEmpty({ message: 'Nome do produto não pode ser vazio.' })
  productName!: string;

  @ApiPropertyOptional({
    example: 'MILHEIRO',
    description: 'Unidade de medida (MILHEIRO, UN, KG, SACO)',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: 100,
    description: 'Quantidade solicitada',
  })
  @IsNumber({}, { message: 'Quantidade deve ser um número.' })
  @Min(0.0001, { message: 'Quantidade deve ser maior que zero.' })
  quantity!: number;

  @ApiProperty({
    example: 12.5,
    description: 'Preço unitário em R$',
  })
  @IsNumber({}, { message: 'Preço unitário deve ser um número.' })
  @Min(0, { message: 'Preço unitário não pode ser negativo.' })
  unitPrice!: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Valor de desconto aplicado ao item',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Desconto deve ser numérico.' })
  @Min(0, { message: 'Desconto não pode ser negativo.' })
  discount?: number;

  @ApiPropertyOptional({
    example: 'Entregar com embalagem oxigenada',
    description: 'Observações do item',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'PRODUCT',
    enum: ['PRODUCT', 'SERVICE'],
    description: 'Tipo do item',
  })
  @IsOptional()
  @IsEnum(['PRODUCT', 'SERVICE'], {
    message: 'Tipo do item deve ser PRODUCT ou SERVICE.',
  })
  type?: OrderItemType;
}
