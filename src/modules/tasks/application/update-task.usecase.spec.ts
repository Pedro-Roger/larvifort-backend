import { NotFoundException } from '@nestjs/common';
import { UpdateTaskUseCase } from './update-task.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { Task, ProjectColumn } from '../domain/task';

describe('UpdateTaskUseCase', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    columnId: 'c-1',
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

  const SAMPLE_COLUMN: ProjectColumn = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Backlog',
    order: 0,
    color: null,
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
    const columns = {
      findById: jest.fn(),
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects, columns);

    const result = await sut.execute('t-1', { progresso: 100 });

    expect(findTaskById).toHaveBeenCalledWith('t-1');
    expect(update).toHaveBeenCalledWith('t-1', {
      progresso: 100,
      status: 'CONCLUIDO',
    });
    expect(result.status).toBe('CONCLUIDO');
  });

  it('atualiza columnId validando no projeto', async () => {
    const findTaskById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const findColumnById = jest.fn().mockResolvedValue(SAMPLE_COLUMN);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_TASK,
      columnId: 'c-1',
    });

    const tasks = {
      findById: findTaskById,
      update,
    } as unknown as TaskRepositoryPort;
    const projects = {} as unknown as ProjectRepositoryPort;
    const columns = {
      findById: findColumnById,
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects, columns);

    const result = await sut.execute('t-1', { columnId: 'c-1' });

    expect(findColumnById).toHaveBeenCalledWith('c-1');
    expect(result.columnId).toBe('c-1');
  });

  it('lança 404 quando tarefa não existe', async () => {
    const findTaskById = jest.fn().mockResolvedValue(null);

    const tasks = { findById: findTaskById } as unknown as TaskRepositoryPort;
    const projects = {} as unknown as ProjectRepositoryPort;
    const columns = {} as unknown as ProjectColumnRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects, columns);

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
    const columns = {} as unknown as ProjectColumnRepositoryPort;
    const sut = new UpdateTaskUseCase(tasks, projects, columns);

    await expect(sut.execute('t-1', { projetoId: 'p-ghost' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
