import { IsEnum, IsNotEmpty } from 'class-validator';
import type { StatusLead } from '../../domain/client';

export class UpdateClientStatusDto {
  @IsEnum(['NOVO', 'SEM_CONTATO', 'EM_NEGOCIACAO', 'CLIENTE_ATIVO'], {
    message: 'Status inválido.',
  })
  @IsNotEmpty({ message: 'Status é obrigatório.' })
  status!: StatusLead;
}
