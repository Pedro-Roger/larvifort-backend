import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Appointment } from '../domain/appointment';
import type {
  AppointmentRepositoryPort,
  UpdateAppointmentData,
} from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Compromisso não encontrado.');
    }

    const tipo = data.tipo ?? existing.tipo;
    const endereco = data.endereco ?? existing.endereco;

    if (tipo === 'VISITA' && !endereco?.trim()) {
      throw new BadRequestException(
        'Compromissos do tipo VISITA devem ter endereço.',
      );
    }

    return this.repo.update(id, data);
  }
}
