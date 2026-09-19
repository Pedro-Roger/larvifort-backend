import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { TipoUbicacion } from '../../domain/stock-location';
import type { StatusStock } from '../../domain/stock-unit';

export class UpdateStockLocationDto {
  @ApiPropertyOptional({
    example: 'Berçário Norte',
    description: 'Nome do local',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'unit-uuid',
    description: 'ID da unidade produtiva',
  })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({
    example: 'BERCARIO',
    enum: ['BERCARIO', 'ALMACEN', 'OTRO'],
  })
  @IsOptional()
  @IsEnum(['BERCARIO', 'ALMACEN', 'OTRO'], { message: 'Tipo inválido.' })
  type?: TipoUbicacion;

  @ApiPropertyOptional({ example: 5000, description: 'Capacidade' })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ example: 'product-uuid', description: 'Produto armazenado no berçário' })
  @IsOptional()
  @IsString()
  productId?: string | null;

  @ApiPropertyOptional({ example: 'ACTIVA', enum: ['ACTIVA', 'INACTIVA'] })
  @IsOptional()
  @IsEnum(['ACTIVA', 'INACTIVA'], { message: 'Status inválido.' })
  status?: StatusStock;
}
