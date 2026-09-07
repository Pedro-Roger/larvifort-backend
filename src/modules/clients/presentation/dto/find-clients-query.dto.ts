import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../core/common/pagination';
import type { StatusLead } from '../../domain/client';

export class FindClientsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['NOVO', 'SEM_CONTATO', 'EM_NEGOCIACAO', 'CLIENTE_ATIVO'], {
    message: 'Status inválido.',
  })
  status?: StatusLead;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  cidade?: string;
}
