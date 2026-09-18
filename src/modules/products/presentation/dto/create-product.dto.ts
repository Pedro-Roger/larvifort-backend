import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'PL-001', description: 'Código único do produto' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Pós-larva', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'MILHEIRO', description: 'Unidade de medida' })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiPropertyOptional({ example: 100.5, description: 'Preço unitário' })
  @IsOptional()
  @IsNumber()
  price?: number;
}
