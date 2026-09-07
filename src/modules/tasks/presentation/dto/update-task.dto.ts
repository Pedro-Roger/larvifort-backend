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
  @IsOptional()
  @IsString()
  projetoId?: string;

  @IsOptional()
  @IsString({ message: 'Título deve ser texto.' })
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  status?: StatusTarefa;

  @IsOptional()
  @IsEnum(['ALTA', 'MEDIA', 'BAIXA'], {
    message: 'Prioridade deve ser ALTA, MEDIA ou BAIXA.',
  })
  prioridade?: Prioridade;

  @IsOptional()
  @IsInt({ message: 'Progresso deve ser um número inteiro de 0 a 100.' })
  @Min(0, { message: 'Progresso mínimo é 0.' })
  @Max(100, { message: 'Progresso máximo é 100.' })
  progresso?: number;

  @IsOptional()
  @IsArray({ message: 'Tags deve ser uma lista.' })
  @IsString({ each: true, message: 'Cada tag deve ser texto.' })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Prazo inválido.' })
  prazo?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Estimativa deve ser numérica.' })
  estimativaH?: number;

  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
