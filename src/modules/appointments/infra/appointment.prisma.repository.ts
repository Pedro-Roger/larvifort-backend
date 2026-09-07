import { Inject, Injectable } from '@nestjs/common';
import type { Appointment, TipoCompromisso } from '../domain/appointment';
import type {
  AppointmentRepositoryPort,
  CalendarDay,
  CreateAppointmentData,
  FindAppointmentsFilter,
  UpdateAppointmentData,
} from '../application/ports/appointment-repository.port';

export const PRISMA_APPOINTMENTS_TOKEN = 'PRISMA_APPOINTMENTS_TOKEN';

interface AppointmentRow {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  data: Date;
  horario: string | null;
  endereco: string | null;
  observacoes: string | null;
  clienteId: string | null;
  empresaId: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaAppointmentCrud {
  appointment: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<AppointmentRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id: string };
      select: Record<string, true>;
    }): Promise<AppointmentRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<AppointmentRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<AppointmentRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
    groupBy(args: {
      by: string[];
      where?: Record<string, unknown>;
      _count?: Record<string, true>;
      orderBy?: Record<string, 'asc' | 'desc'>;
    }): Promise<
      Array<Record<string, unknown> & { _count?: Record<string, number> }>
    >;
  };
}

const APPOINTMENT_SELECT = {
  id: true,
  tipo: true,
  titulo: true,
  data: true,
  horario: true,
  endereco: true,
  observacoes: true,
  clienteId: true,
  empresaId: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepositoryPort {
  constructor(
    @Inject(PRISMA_APPOINTMENTS_TOKEN)
    private readonly prisma: PrismaAppointmentCrud,
  ) {}

  async findMany(
    filter: FindAppointmentsFilter,
  ): Promise<{ data: Appointment[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.tipo !== undefined) {
      where.tipo = filter.tipo;
    }
    if (filter.clienteId !== undefined) {
      where.clienteId = filter.clienteId;
    }
    if (filter.empresaId !== undefined) {
      where.empresaId = filter.empresaId;
    }
    if (filter.de !== undefined || filter.ate !== undefined) {
      const range: Record<string, Date> = {};
      if (filter.de) range.gte = filter.de;
      if (filter.ate) range.lte = filter.ate;
      where.data = range;
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'asc' },
        select: APPOINTMENT_SELECT,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findUnique({
      where: { id },
      select: APPOINTMENT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const row = await this.prisma.appointment.create({
      data: {
        tipo: data.tipo,
        titulo: data.titulo.trim(),
        data: data.data,
        horario: data.horario?.trim() ?? null,
        endereco: data.endereco?.trim() ?? null,
        observacoes: data.observacoes ?? null,
        clienteId: data.clienteId ?? null,
        empresaId: data.empresaId ?? null,
        ownerId: data.ownerId ?? null,
      },
      select: APPOINTMENT_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const updateData: Record<string, unknown> = {};

    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.titulo !== undefined) updateData.titulo = data.titulo.trim();
    if (data.data !== undefined) updateData.data = data.data;
    if (data.horario !== undefined)
      updateData.horario = data.horario?.trim() ?? null;
    if (data.endereco !== undefined)
      updateData.endereco = data.endereco?.trim() ?? null;
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;
    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.empresaId !== undefined) updateData.empresaId = data.empresaId;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;

    const row = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      select: APPOINTMENT_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({ where: { id } });
  }

  async countByDay(year: number, month: number): Promise<CalendarDay[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const rows = await this.prisma.appointment.groupBy({
      by: ['data'],
      where: {
        data: { gte: start, lte: end },
      },
      _count: { data: true },
      orderBy: { data: 'asc' },
    });

    return rows.map((r) => {
      const d = new Date(r.data as Date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return {
        date: `${yyyy}-${mm}-${dd}`,
        count: (r._count as Record<string, number>)?.data ?? 0,
      };
    });
  }

  private toDomain(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      tipo: row.tipo,
      titulo: row.titulo,
      data: row.data,
      horario: row.horario,
      endereco: row.endereco,
      observacoes: row.observacoes,
      clienteId: row.clienteId,
      empresaId: row.empresaId,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
