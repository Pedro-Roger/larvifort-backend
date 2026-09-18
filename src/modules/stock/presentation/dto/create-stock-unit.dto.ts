import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StatusStock } from '../../domain/stock-unit';

export class CreateStockUnitDto {
  @ApiProperty({
    example: 'Morada Nova',
    description: 'Nome da unidade produtiva',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'Morada Nova',
    description: 'Cidade da unidade',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'ACTIVA', enum: ['ACTIVA', 'INACTIVA'] })
  @IsOptional()
  @IsEnum(['ACTIVA', 'INACTIVA'], { message: 'Status inválido.' })
  status?: StatusStock;
}
