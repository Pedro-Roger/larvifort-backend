import { BadRequestException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { Appointment } from '../domain/appointment';

describe('CreateAppointmentUseCase', () => {
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

  it('cria compromisso com clienteId', async () => {
    const createMock = jest.fn().mockResolvedValue(SAMPLE);
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: createMock,
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new CreateAppointmentUseCase(repo);
    const result = await uc.execute({
      tipo: 'VISITA',
      titulo: 'Visita ao cliente',
      data: new Date('2026-10-01T10:00:00'),
      horario: '10:00',
      endereco: 'Rua Exemplo, 123',
      clienteId: 'c-1',
    });
    expect(result).toEqual(SAMPLE);
    expect(createMock).toHaveBeenCalled();
  });

  it('cria compromisso com empresaId', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn().mockResolvedValue(SAMPLE),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new CreateAppointmentUseCase(repo);
    await expect(
      uc.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião com empresa',
        data: new Date('2026-10-01T10:00:00'),
        empresaId: 'e-1',
      }),
    ).resolves.toEqual(SAMPLE);
  });

  it('lança BadRequestException quando não há clienteId nem empresaId', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new CreateAppointmentUseCase(repo);
    await expect(
      uc.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2026-10-01T10:00:00'),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança BadRequestException quando VISITA sem endereço', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new CreateAppointmentUseCase(repo);
    await expect(
      uc.execute({
        tipo: 'VISITA',
        titulo: 'Visita',
        data: new Date('2026-10-01T10:00:00'),
        clienteId: 'c-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança BadRequestException quando data no passado', async () => {
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const uc = new CreateAppointmentUseCase(repo);
    await expect(
      uc.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2020-01-01T10:00:00'),
        clienteId: 'c-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
