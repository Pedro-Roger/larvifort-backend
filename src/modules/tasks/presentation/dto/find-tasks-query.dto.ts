import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../core/common/pagination';
import type { StatusTarefa } from '../../domain/task';

export class FindTasksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  projetoId?: string;

  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  status?: StatusTarefa;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
