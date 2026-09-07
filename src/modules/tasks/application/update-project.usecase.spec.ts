import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProjectUseCase } from './update-project.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('UpdateProjectUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('atualiza projeto com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const findByName = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_PROJECT,
      name: 'Novo Nome',
    });
    const projects = {
      findById,
      findByName,
      update,
    } as unknown as ProjectRepositoryPort;
    const sut = new UpdateProjectUseCase(projects);

    const result = await sut.execute('p-1', { name: 'Novo Nome' });

    expect(findById).toHaveBeenCalledWith('p-1');
    expect(update).toHaveBeenCalledWith('p-1', { name: 'Novo Nome' });
    expect(result.name).toBe('Novo Nome');
  });

  it('lança 404 quando projeto não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const projects = { findById } as unknown as ProjectRepositoryPort;
    const sut = new UpdateProjectUseCase(projects);

    await expect(sut.execute('p-ghost', { name: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 409 quando o novo nome já pertence a outro projeto', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const findByName = jest.fn().mockResolvedValue({
      ...SAMPLE_PROJECT,
      id: 'p-2',
      name: 'App Delivery',
    });
    const update = jest.fn();
    const projects = {
      findById,
      findByName,
      update,
    } as unknown as ProjectRepositoryPort;
    const sut = new UpdateProjectUseCase(projects);

    await expect(sut.execute('p-1', { name: 'App Delivery' })).rejects.toThrow(
      ConflictException,
    );

    expect(update).not.toHaveBeenCalled();
  });
});
