import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'PL-001',
    description: 'Código único do produto',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Pós-larva', description: 'Nome do produto' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'MILHEIRO',
    description: 'Unidade de medida',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 100.5, description: 'Preço unitário' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: true, description: 'Status ativo/inativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
