import { ListAppointmentsUseCase } from './list-appointments.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { Appointment } from '../domain/appointment';

describe('ListAppointmentsUseCase', () => {
  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'VISITA',
    titulo: 'Visita',
    data: new Date('2026-10-01T10:00:00'),
    horario: '10:00',
    endereco: null,
    observacoes: null,
    clienteId: 'c-1',
    empresaId: null,
    ownerId: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  it('retorna lista paginada', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn().mockResolvedValue({ data: [SAMPLE], total: 1 }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new ListAppointmentsUseCase(repo);
    const result = await uc.execute({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('normaliza page e limit', async () => {
    const findManyMock = jest.fn().mockResolvedValue({ data: [], total: 0 });
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: findManyMock,
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new ListAppointmentsUseCase(repo);
    // page=0 is falsy → falls back to 1 via `||`; limit=0 is falsy → falls back to 20
    await uc.execute({ page: 0, limit: 0 });
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });
});
