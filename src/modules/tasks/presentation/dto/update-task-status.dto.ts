import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { StatusTarefa } from '../../domain/task';

export class UpdateTaskStatusDto {
  @ApiPropertyOptional({
    example: 'c-2',
    description: 'ID da coluna destino para onde mover a tarefa',
  })
  @IsOptional()
  @IsString({ message: 'columnId deve ser texto.' })
  columnId?: string;

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
    example: 50,
    description: 'Progresso percentual de 0 a 100',
  })
  @IsOptional()
  @IsInt({ message: 'Progresso deve ser um número inteiro de 0 a 100.' })
  @Min(0, { message: 'Progresso mínimo é 0.' })
  @Max(100, { message: 'Progresso máximo é 100.' })
  progresso?: number;
}
