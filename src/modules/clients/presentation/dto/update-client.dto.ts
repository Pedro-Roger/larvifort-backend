import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { StatusLead } from '../../domain/client';

export class UpdateClientDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser texto.' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento inválida.' })
  birthdate?: Date;

  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @IsOptional()
  @IsEnum(['NOVO', 'SEM_CONTATO', 'EM_NEGOCIACAO', 'CLIENTE_ATIVO'], {
    message: 'Status inválido.',
  })
  statusLead?: StatusLead;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Lâmina de água deve ser numérico.' })
  laminaAgua?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Quantidade de viveiros deve ser numérico.' })
  qtdViveiros?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Densidade deve ser numérico.' })
  densidade?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Produção média deve ser numérico.' })
  producaoMedia?: number;

  @IsOptional()
  @IsBoolean()
  temBercario?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Quantidade de berçários deve ser numérico.' })
  qtdBercarios?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Volume de berçários deve ser numérico.' })
  volumeBercarios?: number;

  @IsOptional()
  @IsBoolean()
  alimentadorAutomatico?: boolean;
}
