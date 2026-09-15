import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { OrderPhase, OrderStatus } from '../../domain/order';

export class FindOrdersQueryDto {
  @ApiPropertyOptional({
    example: 'PEDIDO',
    enum: ['ORCAMENTO', 'PEDIDO'],
    description: 'Filtrar por status',
  })
  @IsOptional()
  @IsEnum(['ORCAMENTO', 'PEDIDO'])
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'ABERTO',
    enum: [
      'DRAFT',
      'ABERTO',
      'PENDING',
      'APROVADO',
      'FATURADO',
      'ENTREGUE',
      'CANCELLED',
    ],
    description: 'Filtrar por fase',
  })
  @IsOptional()
  @IsEnum([
    'DRAFT',
    'ABERTO',
    'PENDING',
    'APROVADO',
    'FATURADO',
    'ENTREGUE',
    'CANCELLED',
  ])
  phase?: OrderPhase;

  @ApiPropertyOptional({
    example: 'client-123',
    description: 'Filtrar por cliente',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'project-123',
    description: 'Filtrar por projeto/board',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    example: 'user-123',
    description: 'Filtrar por vendedor',
  })
  @IsOptional()
  @IsString()
  salesRepUserId?: string;

  @ApiPropertyOptional({
    example: 'Carlos',
    description:
      'Busca textual por número do pedido, nome do cliente ou CPF/CNPJ',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '2026-09-01T00:00:00.000Z',
    description: 'Data inicial (de)',
  })
  @IsOptional()
  @IsDateString()
  de?: string;

  @ApiPropertyOptional({
    example: '2026-09-30T23:59:59.000Z',
    description: 'Data final (ate)',
  })
  @IsOptional()
  @IsDateString()
  ate?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Número da página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Quantidade por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
