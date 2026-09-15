import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfirmTaskActivityUseCase } from './confirm-task-activity.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task, TaskActivityConfirmation } from '../domain/task';

describe('ConfirmTaskActivityUseCase', () => {
  const SAMPLE_CONFIRMATION: TaskActivityConfirmation = {
    id: 'conf-1',
    taskId: 'task-1',
    confirmedById: 'user-1',
    confirmedAt: new Date('2026-10-15T14:30:00.000Z'),
    latitude: -3.7319,
    longitude: -38.5267,
    accuracyMeters: 15.0,
    createdAt: new Date('2026-10-15T14:30:00.000Z'),
  };

  const SAMPLE_COMPROMISSO_TASK: Task = {
    id: 'task-1',
    projetoId: 'proj-1',
    columnId: 'col-1',
    titulo: 'Visita Técnica Fazenda',
    descricao: 'Visita agendada',
    status: 'EM_ANDAMENTO',
    tipo: 'COMPROMISSO',
    appointmentId: 'app-1',
    clienteId: 'client-1',
    confirmation: null,
    prioridade: 'MEDIA',
    progresso: 50,
    tags: ['COMPROMISSO'],
    prazo: null,
    estimativaH: null,
    assigneeId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_GERAL_TASK: Task = {
    ...SAMPLE_COMPROMISSO_TASK,
    id: 'task-geral-1',
    tipo: 'GERAL',
    appointmentId: null,
  };

  function makeSut(mocks?: {
    findTaskById?: jest.Mock;
    findConfirmation?: jest.Mock;
    confirmActivity?: jest.Mock;
  }) {
    const tasksRepo: TaskRepositoryPort = {
      findMany: jest.fn(),
      findById:
        mocks?.findTaskById ??
        jest.fn().mockResolvedValue(SAMPLE_COMPROMISSO_TASK),
      findByAppointmentId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      confirmActivity:
        mocks?.confirmActivity ??
        jest.fn().mockResolvedValue(SAMPLE_CONFIRMATION),
      findConfirmationByTaskId:
        mocks?.findConfirmation ?? jest.fn().mockResolvedValue(null),
    };

    const sut = new ConfirmTaskActivityUseCase(tasksRepo);
    return { sut, tasksRepo };
  }

  it('confirma atividade com sucesso para task de compromisso pelo responsável', async () => {
    const confirmMock = jest.fn().mockResolvedValue(SAMPLE_CONFIRMATION);
    const { sut } = makeSut({ confirmActivity: confirmMock });

    const result = await sut.execute(
      'task-1',
      { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
      { id: 'user-1', role: 'USER' },
    );

    expect(result).toEqual(SAMPLE_CONFIRMATION);
    expect(confirmMock).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({
        confirmedById: 'user-1',
        latitude: -3.7319,
        longitude: -38.5267,
        accuracyMeters: 15.0,
      }),
    );
  });

  it('permite ADMIN confirmar atividade mesmo não sendo o assignee', async () => {
    const confirmMock = jest.fn().mockResolvedValue(SAMPLE_CONFIRMATION);
    const { sut } = makeSut({ confirmActivity: confirmMock });

    const result = await sut.execute(
      'task-1',
      { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
      { id: 'admin-user', role: 'ADMIN' },
    );

    expect(result).toEqual(SAMPLE_CONFIRMATION);
  });

  it('lança NotFoundException se tarefa não existir', async () => {
    const findMock = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findTaskById: findMock });

    await expect(
      sut.execute(
        'task-missing',
        { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
        { id: 'user-1', role: 'USER' },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança BadRequestException para task do tipo GERAL', async () => {
    const findMock = jest.fn().mockResolvedValue(SAMPLE_GERAL_TASK);
    const { sut } = makeSut({ findTaskById: findMock });

    await expect(
      sut.execute(
        'task-geral-1',
        { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
        { id: 'user-1', role: 'USER' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança ConflictException se a tarefa já tiver confirmação', async () => {
    const findConfMock = jest.fn().mockResolvedValue(SAMPLE_CONFIRMATION);
    const { sut } = makeSut({ findConfirmation: findConfMock });

    await expect(
      sut.execute(
        'task-1',
        { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
        { id: 'user-1', role: 'USER' },
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('lança ForbiddenException se usuário comum não for o assignee', async () => {
    const taskComOutroAssignee: Task = {
      ...SAMPLE_COMPROMISSO_TASK,
      assigneeId: 'outro-user',
    };
    const findMock = jest.fn().mockResolvedValue(taskComOutroAssignee);
    const { sut } = makeSut({ findTaskById: findMock });

    await expect(
      sut.execute(
        'task-1',
        { latitude: -3.7319, longitude: -38.5267, accuracyMeters: 15.0 },
        { id: 'user-1', role: 'USER' },
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
