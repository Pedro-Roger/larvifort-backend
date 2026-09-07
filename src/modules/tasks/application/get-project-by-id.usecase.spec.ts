import { NotFoundException } from '@nestjs/common';
import { GetProjectByIdUseCase } from './get-project-by-id.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('GetProjectByIdUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna projeto quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const sut = new GetProjectByIdUseCase(projects);

    const result = await sut.execute('p-1');

    expect(findById).toHaveBeenCalledWith('p-1');
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('lança 404 quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const sut = new GetProjectByIdUseCase(projects);

    await expect(sut.execute('p-ghost')).rejects.toThrow(NotFoundException);
  });
});
