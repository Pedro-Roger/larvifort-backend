import { NotFoundException } from '@nestjs/common';
import { DeleteProjectUseCase } from './delete-project.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('DeleteProjectUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('deleta projeto quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const del = jest.fn().mockResolvedValue(undefined);
    const projects = {
      findById,
      delete: del,
    } as unknown as ProjectRepositoryPort;
    const sut = new DeleteProjectUseCase(projects);

    await sut.execute('p-1');

    expect(findById).toHaveBeenCalledWith('p-1');
    expect(del).toHaveBeenCalledWith('p-1');
  });

  it('lança 404 quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const projects = {
      findById,
      delete: del,
    } as unknown as ProjectRepositoryPort;
    const sut = new DeleteProjectUseCase(projects);

    await expect(sut.execute('p-ghost')).rejects.toThrow(NotFoundException);
    expect(del).not.toHaveBeenCalled();
  });
});
