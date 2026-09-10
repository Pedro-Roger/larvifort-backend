import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../core/common/pagination';
import type { StatusTarefa } from '../../domain/task';

export class FindTasksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'p-1',
    description: 'Filtrar tarefas por ID do projeto',
  })
  @IsOptional()
  @IsString()
  projetoId?: string;

  @ApiPropertyOptional({
    example: 'c-1',
    description: 'Filtrar tarefas por ID da coluna persistida',
  })
  @IsOptional()
  @IsString()
  columnId?: string;

  @ApiPropertyOptional({
    example: 'EM_ANDAMENTO',
    enum: ['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'],
    description: 'Filtrar tarefas por status legado',
  })
  @IsOptional()
  @IsEnum(['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDO'], {
    message: 'Status deve ser BACKLOG, EM_ANDAMENTO, EM_REVISAO ou CONCLUIDO.',
  })
  status?: StatusTarefa;

  @ApiPropertyOptional({
    example: 'u-1',
    description: 'Filtrar tarefas por ID do usuário atribuído',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
