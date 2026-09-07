import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdUseCase } from './get-task-by-id.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task } from '../domain/task';

describe('GetTaskByIdUseCase', () => {
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

  it('retorna tarefa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const tasks = { findById } as unknown as TaskRepositoryPort;
    const sut = new GetTaskByIdUseCase(tasks);

    const result = await sut.execute('t-1');

    expect(findById).toHaveBeenCalledWith('t-1');
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('lança 404 quando tarefa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const tasks = { findById } as unknown as TaskRepositoryPort;
    const sut = new GetTaskByIdUseCase(tasks);

    await expect(sut.execute('t-ghost')).rejects.toThrow(NotFoundException);
  });
});
