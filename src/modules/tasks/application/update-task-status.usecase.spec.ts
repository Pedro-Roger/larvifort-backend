import { NotFoundException } from '@nestjs/common';
import { UpdateTaskStatusUseCase } from './update-task-status.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task } from '../domain/task';

describe('UpdateTaskStatusUseCase', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'EM_ANDAMENTO',
    prioridade: 'MEDIA',
    progresso: 50,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('altera status para CONCLUIDO e ajusta progresso para 100', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_TASK,
      status: 'CONCLUIDO',
      progresso: 100,
    });
    const tasks = { findById, update } as unknown as TaskRepositoryPort;
    const sut = new UpdateTaskStatusUseCase(tasks);

    const result = await sut.execute('t-1', { status: 'CONCLUIDO' });

    expect(findById).toHaveBeenCalledWith('t-1');
    expect(update).toHaveBeenCalledWith('t-1', {
      status: 'CONCLUIDO',
      progresso: 100,
    });
    expect(result.status).toBe('CONCLUIDO');
  });

  it('lança 404 quando tarefa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const tasks = { findById } as unknown as TaskRepositoryPort;
    const sut = new UpdateTaskStatusUseCase(tasks);

    await expect(
      sut.execute('t-ghost', { status: 'CONCLUIDO' }),
    ).rejects.toThrow(NotFoundException);
  });
});
