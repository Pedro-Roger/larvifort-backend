import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TipoUbicacion } from '../../domain/stock-location';
import type { StatusStock } from '../../domain/stock-unit';

export class CreateStockLocationDto {
  @ApiProperty({
    example: 'Berçário Norte',
    description: 'Nome do local/berçário',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'unit-uuid', description: 'ID da unidade produtiva' })
  @IsString()
  @IsNotEmpty()
  unitId!: string;

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
  productId?: string;

  @ApiPropertyOptional({ example: 'ACTIVA', enum: ['ACTIVA', 'INACTIVA'] })
  @IsOptional()
  @IsEnum(['ACTIVA', 'INACTIVA'], { message: 'Status inválido.' })
  status?: StatusStock;
}
