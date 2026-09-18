import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { StockMovementType } from '../../domain/stock-movement';

export class ListMovementsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por producto' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por local' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por pedido' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo' })
  @IsOptional()
  @IsEnum(['ENTRADA', 'SALIDA', 'BLOQUEO', 'AJUSTE'], {
    message: 'Tipo inválido.',
  })
  type?: StockMovementType;

  @ApiPropertyOptional({ description: 'Página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Tamanho de página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
