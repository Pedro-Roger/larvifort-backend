import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Appointment, TipoCompromisso } from '../domain/appointment';
import type { CalendarDay } from '../application/ports/appointment-repository.port';
import { ListAppointmentsUseCase } from '../application/list-appointments.usecase';
import { GetAppointmentByIdUseCase } from '../application/get-appointment-by-id.usecase';
import { CreateAppointmentUseCase } from '../application/create-appointment.usecase';
import { UpdateAppointmentUseCase } from '../application/update-appointment.usecase';
import { DeleteAppointmentUseCase } from '../application/delete-appointment.usecase';
import { GetCalendarUseCase } from '../application/get-calendar.usecase';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';

// TASK 05 — presentation do Appointments Module (Compromissos/Agenda).
// Suporta rotas /appointments (GOAL) e /compromissos (SPECS).
@Controller(['appointments', 'compromissos'])
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly listAppointments: ListAppointmentsUseCase,
    private readonly getAppointmentById: GetAppointmentByIdUseCase,
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly updateAppointment: UpdateAppointmentUseCase,
    private readonly deleteAppointment: DeleteAppointmentUseCase,
    private readonly getCalendar: GetCalendarUseCase,
  ) {}

  @Get()
  findMany(
    @Query() query: FindAppointmentsQueryDto,
  ): Promise<Paginated<Appointment>> {
    const filter: {
      tipo?: TipoCompromisso;
      de?: Date;
      ate?: Date;
      clienteId?: string;
      empresaId?: string;
      page: number;
      limit: number;
    } = {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
    if (query.tipo) filter.tipo = query.tipo;
    if (query.de) filter.de = new Date(query.de);
    if (query.ate) filter.ate = new Date(query.ate);
    if (query.clienteId) filter.clienteId = query.clienteId;
    if (query.empresaId) filter.empresaId = query.empresaId;
    return this.listAppointments.execute(filter);
  }

  @Get('calendario')
  calendar(@Query() query: CalendarQueryDto): Promise<CalendarDay[]> {
    const [yearStr, monthStr] = query.mes.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Mês inválido.');
    }
    return this.getCalendar.execute(year, month);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Appointment> {
    return this.getAppointmentById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.createAppointment.execute({
      tipo: dto.tipo,
      titulo: dto.titulo,
      data: new Date(dto.data),
      horario: dto.horario,
      endereco: dto.endereco,
      observacoes: dto.observacoes,
      clienteId: dto.clienteId ?? null,
      empresaId: dto.empresaId ?? null,
      ownerId: dto.ownerId ?? null,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const data: {
      tipo?: TipoCompromisso;
      titulo?: string;
      data?: Date;
      horario?: string | null;
      endereco?: string | null;
      observacoes?: string | null;
      clienteId?: string | null;
      empresaId?: string | null;
      ownerId?: string | null;
    } = {};
    if (dto.tipo !== undefined) data.tipo = dto.tipo;
    if (dto.titulo !== undefined) data.titulo = dto.titulo;
    if (dto.data !== undefined) data.data = new Date(dto.data);
    if (dto.horario !== undefined) data.horario = dto.horario ?? null;
    if (dto.endereco !== undefined) data.endereco = dto.endereco ?? null;
    if (dto.observacoes !== undefined)
      data.observacoes = dto.observacoes ?? null;
    if (dto.clienteId !== undefined) data.clienteId = dto.clienteId ?? null;
    if (dto.empresaId !== undefined) data.empresaId = dto.empresaId ?? null;
    if (dto.ownerId !== undefined) data.ownerId = dto.ownerId ?? null;
    return this.updateAppointment.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteAppointment.execute(id);
  }
}
