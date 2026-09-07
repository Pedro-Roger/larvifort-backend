import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Appointment } from '../domain/appointment';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class GetAppointmentByIdUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(id: string): Promise<Appointment> {
    const appointment = await this.repo.findById(id);
    if (!appointment) {
      throw new NotFoundException('Compromisso não encontrado.');
    }
    return appointment;
  }
}
