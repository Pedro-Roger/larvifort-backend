import { NotFoundException } from '@nestjs/common';
import { DeleteProjectColumnUseCase } from './delete-project-column.usecase';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { ProjectColumn } from '../domain/task';

describe('DeleteProjectColumnUseCase', () => {
  const existingColumn: ProjectColumn = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Backlog',
    order: 0,
    color: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('deleta coluna existente com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(existingColumn);
    const del = jest.fn().mockResolvedValue(undefined);
    const columns = {
      findById,
      delete: del,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new DeleteProjectColumnUseCase(columns);
    await sut.execute('c-1');

    expect(del).toHaveBeenCalledWith('c-1');
  });

  it('lança NotFoundException quando coluna não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const columns = {
      findById,
      delete: del,
    } as unknown as ProjectColumnRepositoryPort;

    const sut = new DeleteProjectColumnUseCase(columns);
    await expect(sut.execute('c-ghost')).rejects.toThrow(NotFoundException);
  });
});
