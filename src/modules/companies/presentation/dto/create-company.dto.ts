import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { StatusEmpresa } from '../../domain/company';

export class CreateCompanyDto {
  @IsString({ message: 'Nome é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio.' })
  name!: string;

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
  grupoId?: string;
}
