import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { TipoCompromisso } from '../../domain/appointment';

export class FindAppointmentsQueryDto {
  @IsOptional()
  @IsEnum(['REUNIAO', 'VISITA'], {
    message: 'Tipo deve ser REUNIAO ou VISITA.',
  })
  tipo?: TipoCompromisso;

  @IsOptional()
  @IsDateString({}, { message: 'Data "de" inválida.' })
  de?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data "ate" inválida.' })
  ate?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
