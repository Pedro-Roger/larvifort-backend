import { NotFoundException } from '@nestjs/common';
import { CreateTaskUseCase } from './create-task.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { Task, Project, ProjectColumn } from '../domain/task';

describe('CreateTaskUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
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

  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    columnId: 'c-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'CONCLUIDO',
    prioridade: 'MEDIA',
    progresso: 100,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria tarefa e ajusta status para CONCLUIDO quando progresso=100', async () => {
    const findProjectById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const findColumnById = jest.fn().mockResolvedValue(SAMPLE_COLUMN);
    const findColumnsByProject = jest.fn().mockResolvedValue([SAMPLE_COLUMN]);
    const create = jest.fn().mockResolvedValue(SAMPLE_TASK);

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const columns = {
      findById: findColumnById,
      findByProjectId: findColumnsByProject,
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects, columns);

    const result = await sut.execute({
      projetoId: 'p-1',
      columnId: 'c-1',
      titulo: 'Desenvolver API',
      status: 'EM_ANDAMENTO',
      progresso: 100,
    });

    expect(findProjectById).toHaveBeenCalledWith('p-1');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CONCLUIDO',
        progresso: 100,
        columnId: 'c-1',
      }),
    );
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('cria tarefa e ajusta progresso para 100 quando status=CONCLUIDO', async () => {
    const findProjectById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const findColumnsByProject = jest.fn().mockResolvedValue([SAMPLE_COLUMN]);
    const create = jest.fn().mockResolvedValue(SAMPLE_TASK);

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const columns = {
      findById: jest.fn(),
      findByProjectId: findColumnsByProject,
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects, columns);

    await sut.execute({
      projetoId: 'p-1',
      titulo: 'Desenvolver API',
      status: 'CONCLUIDO',
      progresso: 20,
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CONCLUIDO',
        progresso: 100,
        columnId: 'c-1',
      }),
    );
  });

  it('lança 404 quando projeto não existe', async () => {
    const findProjectById = jest.fn().mockResolvedValue(null);
    const create = jest.fn();

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const columns = {
      findById: jest.fn(),
      findByProjectId: jest.fn(),
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects, columns);

    await expect(
      sut.execute({
        projetoId: 'p-ghost',
        titulo: 'Desenvolver API',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(create).not.toHaveBeenCalled();
  });

  it('lança 404 quando coluna informada pertence a outro projeto', async () => {
    const findProjectById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const findColumnById = jest.fn().mockResolvedValue({
      ...SAMPLE_COLUMN,
      projetoId: 'p-other',
    });
    const create = jest.fn();

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const columns = {
      findById: findColumnById,
      findByProjectId: jest.fn(),
    } as unknown as ProjectColumnRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects, columns);

    await expect(
      sut.execute({
        projetoId: 'p-1',
        columnId: 'c-other',
        titulo: 'Desenvolver API',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(create).not.toHaveBeenCalled();
  });
});
