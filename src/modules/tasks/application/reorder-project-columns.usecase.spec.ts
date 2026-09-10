import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReorderProjectColumnsUseCase } from './reorder-project-columns.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { Project, ProjectColumn } from '../domain/task';

describe('ReorderProjectColumnsUseCase', () => {
  const sampleProject: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const reorderedColumns: ProjectColumn[] = [
    {
      id: 'c-2',
      projetoId: 'p-1',
      title: 'Em Andamento',
      order: 0,
      color: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'c-1',
      projetoId: 'p-1',
      title: 'Backlog',
      order: 1,
      color: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('reordena colunas do projeto com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(sampleProject);
    const reorder = jest.fn().mockResolvedValue(reorderedColumns);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { reorder } as unknown as ProjectColumnRepositoryPort;

    const sut = new ReorderProjectColumnsUseCase(projects, columns);
    const result = await sut.execute('p-1', ['c-2', 'c-1']);

    expect(result).toEqual(reorderedColumns);
    expect(reorder).toHaveBeenCalledWith('p-1', ['c-2', 'c-1']);
  });

  it('lança NotFoundException quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const reorder = jest.fn();
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { reorder } as unknown as ProjectColumnRepositoryPort;

    const sut = new ReorderProjectColumnsUseCase(projects, columns);
    await expect(sut.execute('p-ghost', ['c-1'])).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequestException quando lista de IDs está vazia', async () => {
    const findById = jest.fn().mockResolvedValue(sampleProject);
    const reorder = jest.fn();
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { reorder } as unknown as ProjectColumnRepositoryPort;

    const sut = new ReorderProjectColumnsUseCase(projects, columns);
    await expect(sut.execute('p-1', [])).rejects.toThrow(BadRequestException);
  });
});
