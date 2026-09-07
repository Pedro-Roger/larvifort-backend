import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateAppointmentUseCase } from './update-appointment.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { Appointment } from '../domain/appointment';

describe('UpdateAppointmentUseCase', () => {
  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'VISITA',
    titulo: 'Visita ao cliente',
    data: new Date('2026-10-01T10:00:00'),
    horario: '10:00',
    endereco: 'Rua Exemplo, 123',
    observacoes: null,
    clienteId: 'c-1',
    empresaId: null,
    ownerId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  it('atualiza campos do compromisso', async () => {
    const updated = { ...SAMPLE, titulo: 'Atualizado' };
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn().mockResolvedValue(SAMPLE),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(updated),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new UpdateAppointmentUseCase(repo);
    const result = await uc.execute('a-1', { titulo: 'Atualizado' });
    expect(result.titulo).toBe('Atualizado');
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
    const uc = new UpdateAppointmentUseCase(repo);
    await expect(uc.execute('a-ghost', { titulo: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequestException quando VISITA sem endereço', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn().mockResolvedValue(SAMPLE),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new UpdateAppointmentUseCase(repo);
    await expect(uc.execute('a-1', { endereco: '' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
