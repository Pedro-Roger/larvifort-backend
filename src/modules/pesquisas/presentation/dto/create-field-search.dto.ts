import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Uniformidade } from '../../domain/field-search';

export class CreateFieldSearchDto {
  @IsNotEmpty({ message: 'clienteId é obrigatório.' })
  @IsUUID('all', { message: 'clienteId deve ser um UUID válido.' })
  clienteId!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dataPesquisa deve ser uma data válida.' })
  dataPesquisa?: Date;

  @IsOptional()
  @IsUUID('all', { message: 'responsavelId deve ser um UUID válido.' })
  responsavelId?: string;

  @IsArray({ message: 'larvas deve ser um array.' })
  @IsString({ each: true, message: 'Cada larva deve ser uma string.' })
  @IsNotEmpty({ message: 'larvas deve ter pelo menos 1 item.' })
  larvas!: string[];

  @IsNotEmpty({ message: 'maioriaLarvifort é obrigatória.' })
  @IsBoolean({ message: 'maioriaLarvifort deve ser booleano.' })
  maioriaLarvifort!: boolean;

  @IsOptional()
  @IsBoolean({ message: 'parouLarvifort deve ser booleano.' })
  parouLarvifort?: boolean;

  @IsOptional()
  @IsArray({ message: 'motivosSaida deve ser um array.' })
  @IsString({ each: true, message: 'Cada motivo deve ser uma string.' })
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
