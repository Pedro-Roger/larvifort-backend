import { NotFoundException } from '@nestjs/common';
import { DeleteTaskUseCase } from './delete-task.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task } from '../domain/task';

describe('DeleteTaskUseCase', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'BACKLOG',
    prioridade: 'MEDIA',
    progresso: 0,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('deleta tarefa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const del = jest.fn().mockResolvedValue(undefined);
    const tasks = { findById, delete: del } as unknown as TaskRepositoryPort;
    const sut = new DeleteTaskUseCase(tasks);

    await sut.execute('t-1');

    expect(findById).toHaveBeenCalledWith('t-1');
    expect(del).toHaveBeenCalledWith('t-1');
  });

  it('lança 404 quando tarefa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const tasks = { findById, delete: del } as unknown as TaskRepositoryPort;
    const sut = new DeleteTaskUseCase(tasks);

    await expect(sut.execute('t-ghost')).rejects.toThrow(NotFoundException);
    expect(del).not.toHaveBeenCalled();
  });
});
