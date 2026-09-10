import { NotFoundException } from '@nestjs/common';
import { ListProjectColumnsUseCase } from './list-project-columns.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { Project, ProjectColumn } from '../domain/task';

describe('ListProjectColumnsUseCase', () => {
  const sampleProject: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleColumns: ProjectColumn[] = [
    {
      id: 'c-1',
      projetoId: 'p-1',
      title: 'Backlog',
      order: 0,
      color: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'c-2',
      projetoId: 'p-1',
      title: 'Em Andamento',
      order: 1,
      color: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('retorna lista de colunas do projeto existente', async () => {
    const findById = jest.fn().mockResolvedValue(sampleProject);
    const findByProjectId = jest.fn().mockResolvedValue(sampleColumns);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = {
      findByProjectId,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new ListProjectColumnsUseCase(projects, columns);
    const result = await sut.execute('p-1');

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Backlog');
    expect(findByProjectId).toHaveBeenCalledWith('p-1');
  });

  it('lança NotFoundException quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const findByProjectId = jest.fn();
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = {
      findByProjectId,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new ListProjectColumnsUseCase(projects, columns);
    await expect(sut.execute('p-ghost')).rejects.toThrow(NotFoundException);
  });
});
