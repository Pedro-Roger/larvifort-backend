import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { Appointment } from '../domain/appointment';
import type {
  AppointmentRepositoryPort,
  FindAppointmentsFilter,
} from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(
    filter: FindAppointmentsFilter,
  ): Promise<Paginated<Appointment>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.repo.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
