import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { TipoUbicacion } from '../../domain/stock-location';

export class ListStockLocationsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por unidade' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo',
    enum: ['BERCARIO', 'ALMACEN', 'OTRO'],
  })
  @IsOptional()
  @IsEnum(['BERCARIO', 'ALMACEN', 'OTRO'], { message: 'Tipo inválido.' })
  type?: TipoUbicacion;

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
