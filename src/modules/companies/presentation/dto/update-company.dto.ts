import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { StatusEmpresa } from '../../domain/company';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto.' })
  name?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['ATIVA', 'PROSPECT', 'INATIVA'], {
    message: 'Status deve ser ATIVA, PROSPECT ou INATIVA.',
  })
  status?: StatusEmpresa;

  @IsOptional()
  @IsString()
  grupoId?: string | null;
}
