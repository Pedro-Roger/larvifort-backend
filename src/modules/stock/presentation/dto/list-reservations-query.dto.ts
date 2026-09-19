import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { StockReservationStatus } from '../../domain/stock-reservation';

export class ListReservationsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por produto' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por pedido' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status' })
  @IsOptional()
  @IsEnum(['ACTIVA', 'CANCELADA', 'CONSUMIDA'], {
    message: 'Status inválido.',
  })
  status?: StockReservationStatus;

  @ApiPropertyOptional({ description: 'Página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Tamanho da página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
