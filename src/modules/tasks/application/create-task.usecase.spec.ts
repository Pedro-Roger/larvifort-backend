import { NotFoundException } from '@nestjs/common';
import { CreateTaskUseCase } from './create-task.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Task, Project } from '../domain/task';

describe('CreateTaskUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
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
    const create = jest.fn().mockResolvedValue(SAMPLE_TASK);

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects);

    const result = await sut.execute({
      projetoId: 'p-1',
      titulo: 'Desenvolver API',
      status: 'EM_ANDAMENTO',
      progresso: 100,
    });

    expect(findProjectById).toHaveBeenCalledWith('p-1');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CONCLUIDO',
        progresso: 100,
      }),
    );
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('cria tarefa e ajusta progresso para 100 quando status=CONCLUIDO', async () => {
    const findProjectById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const create = jest.fn().mockResolvedValue(SAMPLE_TASK);

    const tasks = { create } as unknown as TaskRepositoryPort;
    const projects = {
      findById: findProjectById,
    } as unknown as ProjectRepositoryPort;
    const sut = new CreateTaskUseCase(tasks, projects);

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
    const sut = new CreateTaskUseCase(tasks, projects);

    await expect(
      sut.execute({
        projetoId: 'p-ghost',
        titulo: 'Desenvolver API',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(create).not.toHaveBeenCalled();
  });
});
