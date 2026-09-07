import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../core/common/pagination';
import type { StatusEmpresa } from '../../domain/company';

export class FindCompaniesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  grupoId?: string;

  @IsOptional()
  @IsEnum(['ATIVA', 'PROSPECT', 'INATIVA'], {
    message: 'Status deve ser ATIVA, PROSPECT ou INATIVA.',
  })
  status?: StatusEmpresa;
}
