import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import type { TipoCompromisso } from '../../domain/appointment';

export class CreateAppointmentDto {
  @IsEnum(['REUNIAO', 'VISITA'], {
    message: 'Tipo deve ser REUNIAO ou VISITA.',
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório.' })
  tipo!: TipoCompromisso;

  @IsString({ message: 'Título deve ser texto.' })
  @IsNotEmpty({ message: 'Título é obrigatório.' })
  titulo!: string;

  @IsDateString({}, { message: 'Data é obrigatória.' })
  @IsNotEmpty({ message: 'Data é obrigatória.' })
  data!: string;

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
