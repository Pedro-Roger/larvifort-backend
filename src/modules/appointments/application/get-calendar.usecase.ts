import { Inject, Injectable } from '@nestjs/common';
import type {
  AppointmentRepositoryPort,
  CalendarDay,
} from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';

@Injectable()
export class GetCalendarUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
  ) {}

  async execute(year: number, month: number): Promise<CalendarDay[]> {
    return this.repo.countByDay(year, month);
  }
}
