import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import type { StatusTarefa } from '../../domain/task';

export class UpdateTaskStatusDto {
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  @IsNotEmpty({ message: 'Status é obrigatório.' })
  status!: StatusTarefa;

  @IsOptional()
  @IsInt({ message: 'Progresso deve ser um número inteiro de 0 a 100.' })
  @Min(0, { message: 'Progresso mínimo é 0.' })
  @Max(100, { message: 'Progresso máximo é 100.' })
  progresso?: number;
}
