import {
  IsArray,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Uniformidade } from '../../domain/field-search';

export class UpdateFieldSearchDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dataPesquisa deve ser uma data válida.' })
  dataPesquisa?: Date;

  @IsOptional()
  @IsUUID()
  responsavelId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  larvas?: string[];

  @IsOptional()
  @IsBoolean()
  maioriaLarvifort?: boolean;

  @IsOptional()
  @IsBoolean()
  parouLarvifort?: boolean;

  @IsOptional()
  @IsArray()
  motivosSaida?: string[];

  @IsOptional()
  @IsString()
  outroMotivo?: string;

  @IsOptional()
  @IsEnum(['OTIMA', 'BOA', 'REGULAR', 'RUIM'], {
    message: 'uniformidadeBercario inválido.',
  })
  uniformidadeBercario?: Uniformidade;

  @IsOptional()
  @IsEnum(['OTIMA', 'BOA', 'REGULAR', 'RUIM'], {
    message: 'uniformidadeCultivo inválido.',
  })
  uniformidadeCultivo?: Uniformidade;

  @IsOptional()
  @IsNumber({}, { message: 'sobrevBercario deve ser numérico.' })
  @Type(() => Number)
  sobrevBercario?: number;

  @IsOptional()
  @IsNumber({}, { message: 'sobrevCultivo deve ser numérico.' })
  @Type(() => Number)
  sobrevCultivo?: number;

  @IsOptional()
  @IsString()
  resultadosUltimoCiclo?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
