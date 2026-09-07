import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import type { TipoCompromisso } from '../../domain/appointment';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(['REUNIAO', 'VISITA'], {
    message: 'Tipo deve ser REUNIAO ou VISITA.',
  })
  tipo?: TipoCompromisso;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data inválida.' })
  data?: string;

  @IsOptional()
  @IsString()
  horario?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
