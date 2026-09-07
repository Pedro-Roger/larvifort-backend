import type { Appointment, TipoCompromisso } from '../../domain/appointment';

export const APPOINTMENT_REPOSITORY_PORT = 'APPOINTMENT_REPOSITORY_PORT';

export interface FindAppointmentsFilter {
  tipo?: TipoCompromisso;
  de?: Date;
  ate?: Date;
  clienteId?: string;
  empresaId?: string;
  page: number;
  limit: number;
}

export interface CreateAppointmentData {
  tipo: TipoCompromisso;
  titulo: string;
  data: Date;
  horario?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  clienteId?: string | null;
  empresaId?: string | null;
  ownerId?: string | null;
}

export interface UpdateAppointmentData {
  tipo?: TipoCompromisso;
  titulo?: string;
  data?: Date;
  horario?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  clienteId?: string | null;
  empresaId?: string | null;
  ownerId?: string | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AppointmentRepositoryPort {
  findMany(
    filter: FindAppointmentsFilter,
  ): Promise<{ data: Appointment[]; total: number }>;
  findById(id: string): Promise<Appointment | null>;
  create(data: CreateAppointmentData): Promise<Appointment>;
  update(id: string, data: UpdateAppointmentData): Promise<Appointment>;
  delete(id: string): Promise<void>;
  countByDay(year: number, month: number): Promise<CalendarDay[]>;
}
