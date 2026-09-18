import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StockMovementType } from '../../domain/stock-movement';

export class CreateMovementDto {
  @ApiProperty({ example: 'prod-uuid', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'loc-uuid', description: 'ID del local/berçário' })
  @IsString()
  @IsNotEmpty()
  stockLocationId!: string;

  @ApiProperty({
    example: 'ENTRADA',
    enum: ['ENTRADA', 'SALIDA', 'BLOQUEO', 'AJUSTE'],
  })
  @IsEnum(['ENTRADA', 'SALIDA', 'BLOQUEO', 'AJUSTE'], {
    message: 'Tipo inválido.',
  })
  type!: StockMovementType;

  @ApiProperty({ example: 5000, description: 'Cantidad' })
  @IsNumber()
  quantity!: number;

  @ApiPropertyOptional({ example: 'Compra inicial', description: 'Motivo' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'order-uuid', description: 'ID del pedido' })
  @IsOptional()
  @IsString()
  orderId?: string;
}
