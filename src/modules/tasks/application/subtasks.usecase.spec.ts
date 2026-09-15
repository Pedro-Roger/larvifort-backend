/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSubtaskUseCase } from './create-subtask.usecase';
import { ListSubtasksUseCase } from './list-subtasks.usecase';
import { UpdateSubtaskUseCase } from './update-subtask.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task } from '../domain/task';

const parent = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projetoId: 'project-1',
  columnId: 'column-1',
  titulo: 'Atividade principal',
  descricao: null,
  status: 'EM_ANDAMENTO',
  prioridade: 'MEDIA',
  progresso: 0,
  tags: [],
  prazo: null,
  estimativaH: null,
  assigneeId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const subtask = (overrides: Partial<Task> = {}): Task =>
  parent({
    id: 'task-2',
    parentId: 'task-1',
    titulo: 'Subtarefa',
    ...overrides,
  });

type MockedRepo = {
  findById: jest.Mock;
  create: jest.Mock;
  findMany: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  findByAppointmentId: jest.Mock;
  confirmActivity: jest.Mock;
  findConfirmationByTaskId: jest.Mock;
  syncParentProgress: jest.Mock;
};

function makeRepo(): MockedRepo & TaskRepositoryPort {
  const repo = {
    findById: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByAppointmentId: jest.fn(),
    confirmActivity: jest.fn(),
    findConfirmationByTaskId: jest.fn(),
    syncParentProgress: jest.fn(),
  };
  return repo;
}

describe('subtasks use cases', () => {
  it('cria uma subtarefa no mesmo projeto e vincula ao pai', async () => {
    const tasks = makeRepo();
    tasks.findById.mockResolvedValue(parent());
    tasks.create.mockResolvedValue(subtask());
    const sut = new CreateSubtaskUseCase(tasks);

    const result = await sut.execute('task-1', {
      titulo: 'Subtarefa nova',
      assigneeId: 'user-2',
    });

    expect(tasks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projetoId: 'project-1',
        parentId: 'task-1',
        titulo: 'Subtarefa nova',
        assigneeId: 'user-2',
      }),
    );
    expect(tasks.syncParentProgress).toHaveBeenCalledWith('task-1');
    expect(result.id).toBe('task-2');
  });

  it('rejeita subtarefa de uma subtarefa', async () => {
    const tasks = makeRepo();
    tasks.findById.mockResolvedValue(subtask());
    const sut = new CreateSubtaskUseCase(tasks);

    await expect(
      sut.execute('task-2', { titulo: 'Nível inválido' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tasks.create).not.toHaveBeenCalled();
  });

  it('lista somente as subtarefas da task principal', async () => {
    const tasks = makeRepo();
    const child = subtask();
    tasks.findById.mockResolvedValue(parent());
    tasks.findMany.mockResolvedValue({ data: [child], total: 1 });
    const sut = new ListSubtasksUseCase(tasks);

    await expect(sut.execute('task-1')).resolves.toEqual([child]);
    expect(tasks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        projetoId: 'project-1',
        parentId: 'task-1',
      }),
    );
  });

  it('atualiza a subtarefa e sincroniza o progresso do pai', async () => {
    const tasks = makeRepo();
    tasks.findById.mockResolvedValue(subtask());
    tasks.update.mockResolvedValue(
      subtask({ status: 'CONCLUIDO', progresso: 100 }),
    );
    const sut = new UpdateSubtaskUseCase(tasks);

    await expect(
      sut.execute('task-2', { status: 'CONCLUIDO' }),
    ).resolves.toMatchObject({ status: 'CONCLUIDO' });
    expect(tasks.update).toHaveBeenCalledWith('task-2', {
      status: 'CONCLUIDO',
    });
    expect(tasks.syncParentProgress).toHaveBeenCalledWith('task-1');
  });

  it('retorna 404 quando a task pai não existe', async () => {
    const tasks = makeRepo();
    tasks.findById.mockResolvedValue(null);
    const sut = new ListSubtasksUseCase(tasks);

    await expect(sut.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
