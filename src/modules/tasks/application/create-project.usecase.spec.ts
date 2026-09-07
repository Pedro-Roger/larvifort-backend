import { ConflictException } from '@nestjs/common';
import { CreateProjectUseCase } from './create-project.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('CreateProjectUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria projeto com sucesso', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    const result = await sut.execute({ name: 'LarviFort CRM' });

    expect(findByName).toHaveBeenCalledWith('LarviFort CRM');
    expect(create).toHaveBeenCalledWith({ name: 'LarviFort CRM' });
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('lança 409 quando nome de projeto já existe', async () => {
    const findByName = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const create = jest.fn();
    const projects = { findByName, create } as unknown as ProjectRepositoryPort;
    const sut = new CreateProjectUseCase(projects);

    await expect(sut.execute({ name: 'LarviFort CRM' })).rejects.toThrow(
      ConflictException,
    );

    expect(create).not.toHaveBeenCalled();
  });
});
