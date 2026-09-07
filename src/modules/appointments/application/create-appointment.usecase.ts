import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Appointment } from '../domain/appointment';
import type {
  AppointmentRepositoryPort,
  CreateAppointmentData,
} from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(data: CreateAppointmentData): Promise<Appointment> {
    if (!data.clienteId && !data.empresaId) {
      throw new BadRequestException(
        'É obrigatório informar pelo menos clienteId ou empresaId.',
      );
    }

    if (data.tipo === 'VISITA' && !data.endereco?.trim()) {
      throw new BadRequestException(
        'Compromissos do tipo VISITA devem ter endereço.',
      );
    }

    const now = new Date();
    const dataCompromisso = new Date(data.data);
    if (dataCompromisso < now) {
      throw new BadRequestException(
        'Não é possível criar compromisso com data no passado.',
      );
    }

    return this.repo.create(data);
  }
}
