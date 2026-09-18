import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TipoCompromisso } from '../../domain/appointment';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'VISITA',
    enum: ['REUNIAO', 'VISITA'],
    description: 'Tipo do compromisso',
  })
  @IsEnum(['REUNIAO', 'VISITA'], {
    message: 'Tipo deve ser REUNIAO ou VISITA.',
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório.' })
  tipo!: TipoCompromisso;

  @ApiProperty({
    example: 'Visita técnica - Fazenda São José',
    description: 'Título do compromisso',
  })
  @IsString({ message: 'Título deve ser texto.' })
  @IsNotEmpty({ message: 'Título é obrigatório.' })
  titulo!: string;

  @ApiProperty({
    example: '2026-10-15T10:00:00.000Z',
    description: 'Data do compromisso (ISO 8601)',
  })
  @IsDateString({}, { message: 'Data é obrigatória.' })
  @IsNotEmpty({ message: 'Data é obrigatória.' })
  data!: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Horário HH:mm' })
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiPropertyOptional({
    example: 'Fazenda São José, Aracati - CE',
    description: 'Endereço da visita',
  })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({
    example: 'Levar amostras',
    description: 'Observações do compromisso',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({
    example: 'cliente-uuid',
    description: 'ID do cliente real (obrigatório). Empresa não é válida',
  })
  @IsString({ message: 'Cliente é obrigatório.' })
  @IsNotEmpty({ message: 'Cliente é obrigatório.' })
  clienteId!: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({
    example: 'projeto-uuid',
    description:
      'Projeto opcional para activar la creación automática del card de compromiso en el Kanban (API-012).',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
