import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProjectColumnUseCase } from './create-project-column.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { Project, ProjectColumn } from '../domain/task';

describe('CreateProjectColumnUseCase', () => {
  const sampleProject: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdColumn: ProjectColumn = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Testes',
    order: 2,
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria coluna no projeto com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(sampleProject);
    const create = jest.fn().mockResolvedValue(createdColumn);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { create } as unknown as ProjectColumnRepositoryPort;

    const sut = new CreateProjectColumnUseCase(projects, columns);
    const result = await sut.execute('p-1', {
      title: 'Testes',
      order: 2,
      color: '#3b82f6',
    });

    expect(result).toEqual(createdColumn);
    expect(create).toHaveBeenCalledWith({
      projetoId: 'p-1',
      title: 'Testes',
      order: 2,
      color: '#3b82f6',
    });
  });

  it('lança NotFoundException quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const create = jest.fn();
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { create } as unknown as ProjectColumnRepositoryPort;

    const sut = new CreateProjectColumnUseCase(projects, columns);
    await expect(sut.execute('p-ghost', { title: 'Testes' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequestException quando título está vazio', async () => {
    const findById = jest.fn().mockResolvedValue(sampleProject);
    const create = jest.fn();
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const columns = { create } as unknown as ProjectColumnRepositoryPort;

    const sut = new CreateProjectColumnUseCase(projects, columns);
    await expect(sut.execute('p-1', { title: '   ' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
