import { NotFoundException } from '@nestjs/common';
import { DeleteAppointmentUseCase } from './delete-appointment.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { Appointment } from '../domain/appointment';

describe('DeleteAppointmentUseCase', () => {
  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'REUNIAO',
    titulo: 'Reunião',
    data: new Date('2026-10-01T10:00:00'),
    horario: null,
    endereco: null,
    observacoes: null,
    clienteId: 'c-1',
    empresaId: null,
    ownerId: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  it('deleta compromisso existente', async () => {
    const deleteMock = jest.fn().mockResolvedValue(undefined);
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn().mockResolvedValue(SAMPLE),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: deleteMock,
      countByDay: jest.fn(),
    };
    const uc = new DeleteAppointmentUseCase(repo);
    await uc.execute('a-1');
    expect(deleteMock).toHaveBeenCalledWith('a-1');
  });

  it('lança NotFoundException quando não existe', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn().mockResolvedValue(null),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new DeleteAppointmentUseCase(repo);
    await expect(uc.execute('a-ghost')).rejects.toThrow(NotFoundException);
  });
});
