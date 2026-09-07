import { NotFoundException } from '@nestjs/common';
import { GetAppointmentByIdUseCase } from './get-appointment-by-id.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { Appointment } from '../domain/appointment';

describe('GetAppointmentByIdUseCase', () => {
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

  it('retorna o compromisso quando existe', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(SAMPLE);
    const repo: AppointmentRepositoryPort = {
      findById: findByIdMock,
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new GetAppointmentByIdUseCase(repo);
    const result = await uc.execute('a-1');
    expect(result).toEqual(SAMPLE);
    expect(findByIdMock).toHaveBeenCalledWith('a-1');
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
    const uc = new GetAppointmentByIdUseCase(repo);
    await expect(uc.execute('a-ghost')).rejects.toThrow(NotFoundException);
  });
});
