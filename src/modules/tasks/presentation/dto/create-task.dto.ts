import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { Prioridade, StatusTarefa } from '../../domain/task';

export class CreateTaskDto {
  @ApiProperty({
    example: 'p-1',
    description: 'ID do projeto associado',
  })
  @IsString({ message: 'Projeto é obrigatório.' })
  @IsNotEmpty({ message: 'Projeto não pode ser vazio.' })
  projetoId!: string;

  @ApiPropertyOptional({
    example: 'c-1',
    description: 'ID da coluna persistida no projeto',
  })
  @IsOptional()
  @IsString({ message: 'Coluna deve ser texto.' })
  columnId?: string;

  @ApiProperty({
    example: 'Implementar API',
    description: 'Título da tarefa',
  })
  @IsString({ message: 'Título é obrigatório.' })
  @IsNotEmpty({ message: 'Título não pode ser vazio.' })
  titulo!: string;

  @ApiPropertyOptional({
    example: 'Descrição detalhada da tarefa',
    description: 'Descrição da tarefa',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    example: 'BACKLOG',
    enum: ['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'],
    description: 'Status legado da tarefa',
  })
  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  status?: StatusTarefa;

  @ApiPropertyOptional({
    example: 'MEDIA',
    enum: ['ALTA', 'MEDIA', 'BAIXA'],
    description: 'Prioridade da tarefa',
  })
  @IsOptional()
  @IsEnum(['ALTA', 'MEDIA', 'BAIXA'], {
    message: 'Prioridade deve ser ALTA, MEDIA ou BAIXA.',
  })
  prioridade?: Prioridade;

  @ApiPropertyOptional({
    example: 0,
    description: 'Progresso percentual de 0 a 100',
  })
  @IsOptional()
  @IsInt({ message: 'Progresso deve ser um número inteiro de 0 a 100.' })
  @Min(0, { message: 'Progresso mínimo é 0.' })
  @Max(100, { message: 'Progresso máximo é 100.' })
  progresso?: number;

  @ApiPropertyOptional({
    example: ['backend', 'api'],
    description: 'Tags associadas à tarefa (máx. 5)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags deve ser uma lista.' })
  @IsString({ each: true, message: 'Cada tag deve ser texto.' })
  tags?: string[];

  @ApiPropertyOptional({
    example: '2026-10-01T00:00:00.000Z',
    description: 'Prazo limite da tarefa',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Prazo inválido.' })
  prazo?: Date;

  @ApiPropertyOptional({
    example: 8.5,
    description: 'Estimativa de esforço em horas',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Estimativa deve ser numérica.' })
  estimativaH?: number;

  @ApiPropertyOptional({
    example: 'u-1',
    description: 'ID do usuário responsável',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
