import { NotFoundException } from '@nestjs/common';
import { UpdateTaskUseCase } from './update-task.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Task } from '../domain/task';

describe('UpdateTaskUseCase', () => {
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

  it('atualiza tarefa e ajusta status para CONCLUIDO se progresso=100', async () => {
    const findTaskById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_TASK,
      status: 'CONCLUIDO',
      progresso: 100,
    });

    const tasks = {
      findById: findTaskById,
      update,
    } as unknown as TaskRepositoryPort;
    const projects = {} as unknown as ProjectRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects);

    const result = await sut.execute('t-1', { progresso: 100 });

    expect(findTaskById).toHaveBeenCalledWith('t-1');
    expect(update).toHaveBeenCalledWith('t-1', {
      progresso: 100,
      status: 'CONCLUIDO',
    });
    expect(result.status).toBe('CONCLUIDO');
  });

  it('lança 404 quando tarefa não existe', async () => {
    const findTaskById = jest.fn().mockResolvedValue(null);

    const tasks = { findById: findTaskById } as unknown as TaskRepositoryPort;
    const projects = {} as unknown as ProjectRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects);

    await expect(sut.execute('t-ghost', { titulo: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 404 quando novo projeto não existe', async () => {
    const findTaskById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const findProjectById = jest.fn().mockResolvedValue(null);

    const tasks = { findById: findTaskById } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects);

    await expect(sut.execute('t-1', { projetoId: 'p-ghost' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
