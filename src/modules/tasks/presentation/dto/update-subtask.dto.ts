import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { StatusTarefa } from '../../domain/task';

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'])
  status?: StatusTarefa;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progresso?: number;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
