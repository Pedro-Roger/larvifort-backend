import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class DeleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Compromisso não encontrado.');
    }
    await this.repo.delete(id);
  }
}
