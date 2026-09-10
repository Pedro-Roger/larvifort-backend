import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { Prioridade, StatusTarefa } from '../../domain/task';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'p-1',
    description: 'Novo ID de projeto',
  })
  @IsOptional()
  @IsString()
  projetoId?: string;

  @ApiPropertyOptional({
    example: 'c-1',
    description: 'Novo ID de coluna persistida',
  })
  @IsOptional()
  @IsString()
  columnId?: string;

  @ApiPropertyOptional({
    example: 'Implementar API v2',
    description: 'Novo título da tarefa',
  })
  @IsOptional()
  @IsString({ message: 'Título deve ser texto.' })
  titulo?: string;

  @ApiPropertyOptional({
    example: 'Nova descrição',
    description: 'Nova descrição',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    example: 'EM_ANDAMENTO',
    enum: ['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'],
    description: 'Status legado da tarefa',
  })
  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  status?: StatusTarefa;

  @ApiPropertyOptional({
    example: 'ALTA',
    enum: ['ALTA', 'MEDIA', 'BAIXA'],
    description: 'Prioridade da tarefa',
  })
  @IsOptional()
  @IsEnum(['ALTA', 'MEDIA', 'BAIXA'], {
    message: 'Prioridade deve ser ALTA, MEDIA ou BAIXA.',
  })
  prioridade?: Prioridade;

  @ApiPropertyOptional({
    example: 50,
    description: 'Progresso percentual de 0 a 100',
  })
  @IsOptional()
  @IsInt({ message: 'Progresso deve ser um número inteiro de 0 a 100.' })
  @Min(0, { message: 'Progresso mínimo é 0.' })
  @Max(100, { message: 'Progresso máximo é 100.' })
  progresso?: number;

  @ApiPropertyOptional({
    example: ['backend', 'urgente'],
    description: 'Tags associadas à tarefa (máx. 5)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags deve ser uma lista.' })
  @IsString({ each: true, message: 'Cada tag deve ser texto.' })
  tags?: string[];

  @ApiPropertyOptional({
    example: '2026-10-15T00:00:00.000Z',
    description: 'Prazo limite da tarefa',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Prazo inválido.' })
  prazo?: Date;

  @ApiPropertyOptional({
    example: 12,
    description: 'Estimativa de esforço em horas',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Estimativa deve ser numérica.' })
  estimativaH?: number;

  @ApiPropertyOptional({
    example: 'u-2',
    description: 'ID do usuário responsável',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
