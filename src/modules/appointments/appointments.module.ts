import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListAppointmentsUseCase } from './application/list-appointments.usecase';
import { GetAppointmentByIdUseCase } from './application/get-appointment-by-id.usecase';
import { CreateAppointmentUseCase } from './application/create-appointment.usecase';
import { UpdateAppointmentUseCase } from './application/update-appointment.usecase';
import { DeleteAppointmentUseCase } from './application/delete-appointment.usecase';
import { GetCalendarUseCase } from './application/get-calendar.usecase';
import { APPOINTMENT_REPOSITORY_PORT } from './application/ports/appointment-repository.port';
import {
  PRISMA_APPOINTMENTS_TOKEN,
  PrismaAppointmentRepository,
} from './infra/appointment.prisma.repository';
import { AppointmentsController } from './presentation/appointments.controller';

@Module({
  controllers: [AppointmentsController],
  providers: [
    ListAppointmentsUseCase,
    GetAppointmentByIdUseCase,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
    GetCalendarUseCase,
    PrismaAppointmentRepository,
    { provide: PRISMA_APPOINTMENTS_TOKEN, useExisting: PrismaService },
    {
      provide: APPOINTMENT_REPOSITORY_PORT,
      useClass: PrismaAppointmentRepository,
    },
  ],
  exports: [
    APPOINTMENT_REPOSITORY_PORT,
    ListAppointmentsUseCase,
    GetAppointmentByIdUseCase,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
    GetCalendarUseCase,
  ],
})
export class AppointmentsModule {}
