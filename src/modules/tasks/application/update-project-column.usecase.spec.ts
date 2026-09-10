import { NotFoundException } from '@nestjs/common';
import { UpdateProjectColumnUseCase } from './update-project-column.usecase';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { ProjectColumn } from '../domain/task';

describe('UpdateProjectColumnUseCase', () => {
  const existingColumn: ProjectColumn = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Backlog',
    order: 0,
    color: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedColumn: ProjectColumn = {
    ...existingColumn,
    title: 'A Fazer',
    order: 1,
    color: '#ef4444',
  };

  it('atualiza coluna existente com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(existingColumn);
    const update = jest.fn().mockResolvedValue(updatedColumn);
    const columns = {
      findById,
      update,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new UpdateProjectColumnUseCase(columns);
    const result = await sut.execute('c-1', {
      title: 'A Fazer',
      order: 1,
      color: '#ef4444',
    });

    expect(result).toEqual(updatedColumn);
    expect(update).toHaveBeenCalledWith('c-1', {
      title: 'A Fazer',
      order: 1,
      color: '#ef4444',
    });
  });

  it('lança NotFoundException quando coluna não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const update = jest.fn();
    const columns = {
      findById,
      update,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new UpdateProjectColumnUseCase(columns);
    await expect(sut.execute('c-ghost', { title: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
