import { ProjectsController } from './projects.controller';
import type { ListProjectsUseCase } from '../application/list-projects.usecase';
import type { GetProjectByIdUseCase } from '../application/get-project-by-id.usecase';
import type { CreateProjectUseCase } from '../application/create-project.usecase';
import type { UpdateProjectUseCase } from '../application/update-project.usecase';
import type { DeleteProjectUseCase } from '../application/delete-project.usecase';
import type { ListProjectColumnsUseCase } from '../application/list-project-columns.usecase';
import type { CreateProjectColumnUseCase } from '../application/create-project-column.usecase';
import type { UpdateProjectColumnUseCase } from '../application/update-project-column.usecase';
import type { DeleteProjectColumnUseCase } from '../application/delete-project-column.usecase';
import type { ReorderProjectColumnsUseCase } from '../application/reorder-project-columns.usecase';
import type { Project, ProjectColumn } from '../domain/task';

describe('ProjectsController', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_COLUMN: ProjectColumn = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Backlog',
    order: 0,
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();
    const listColsExecute = jest.fn();
    const createColExecute = jest.fn();
    const updateColExecute = jest.fn();
    const deleteColExecute = jest.fn();
    const reorderColsExecute = jest.fn();

    const listProjects = {
      execute: listExecute,
    } as unknown as ListProjectsUseCase;
    const getProjectById = {
      execute: getExecute,
    } as unknown as GetProjectByIdUseCase;
    const createProject = {
      execute: createExecute,
    } as unknown as CreateProjectUseCase;
    const updateProject = {
      execute: updateExecute,
    } as unknown as UpdateProjectUseCase;
    const deleteProject = {
      execute: deleteExecute,
    } as unknown as DeleteProjectUseCase;
    const listColumns = {
      execute: listColsExecute,
    } as unknown as ListProjectColumnsUseCase;
    const createColumn = {
      execute: createColExecute,
    } as unknown as CreateProjectColumnUseCase;
    const updateColumn = {
      execute: updateColExecute,
    } as unknown as UpdateProjectColumnUseCase;
    const deleteColumn = {
      execute: deleteColExecute,
    } as unknown as DeleteProjectColumnUseCase;
    const reorderColumns = {
      execute: reorderColsExecute,
    } as unknown as ReorderProjectColumnsUseCase;

    const sut = new ProjectsController(
      listProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      listColumns,
      createColumn,
      updateColumn,
      deleteColumn,
      reorderColumns,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
      listColsExecute,
      createColExecute,
      updateColExecute,
      deleteColExecute,
      reorderColsExecute,
    };
  }

  it('findAll delega para ListProjectsUseCase', async () => {
    const { sut, listExecute } = makeSut();
    listExecute.mockResolvedValue([SAMPLE_PROJECT]);

    const result = await sut.findAll();

    expect(listExecute).toHaveBeenCalled();
    expect(result).toEqual([SAMPLE_PROJECT]);
  });

  it('findById delega para GetProjectByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_PROJECT);

    const result = await sut.findById('p-1');

    expect(getExecute).toHaveBeenCalledWith('p-1');
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('create delega para CreateProjectUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_PROJECT);

    const dto = { name: 'LarviFort CRM' };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('update delega para UpdateProjectUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_PROJECT, name: 'Novo' });

    const result = await sut.update('p-1', { name: 'Novo' });

    expect(updateExecute).toHaveBeenCalledWith('p-1', { name: 'Novo' });
    expect(result.name).toBe('Novo');
  });

  it('delete delega para DeleteProjectUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('p-1');

    expect(deleteExecute).toHaveBeenCalledWith('p-1');
  });

  it('findColumns delega para ListProjectColumnsUseCase', async () => {
    const { sut, listColsExecute } = makeSut();
    listColsExecute.mockResolvedValue([SAMPLE_COLUMN]);

    const result = await sut.findColumns('p-1');

    expect(listColsExecute).toHaveBeenCalledWith('p-1');
    expect(result).toEqual([SAMPLE_COLUMN]);
  });

  it('createProjectColumn delega para CreateProjectColumnUseCase', async () => {
    const { sut, createColExecute } = makeSut();
    createColExecute.mockResolvedValue(SAMPLE_COLUMN);

    const dto = { title: 'Backlog', order: 0 };
    const result = await sut.createProjectColumn('p-1', dto);

    expect(createColExecute).toHaveBeenCalledWith('p-1', dto);
    expect(result).toEqual(SAMPLE_COLUMN);
  });

  it('updateProjectColumn delega para UpdateProjectColumnUseCase', async () => {
    const { sut, updateColExecute } = makeSut();
    updateColExecute.mockResolvedValue({
      ...SAMPLE_COLUMN,
      title: 'Atualizado',
    });

    const dto = { title: 'Atualizado' };
    const result = await sut.updateProjectColumn('c-1', dto);

    expect(updateColExecute).toHaveBeenCalledWith('c-1', dto);
    expect(result.title).toBe('Atualizado');
  });

  it('deleteProjectColumn delega para DeleteProjectColumnUseCase', async () => {
    const { sut, deleteColExecute } = makeSut();
    deleteColExecute.mockResolvedValue(undefined);

    await sut.deleteProjectColumn('c-1');

    expect(deleteColExecute).toHaveBeenCalledWith('c-1');
  });

  it('reorderProjectColumns delega para ReorderProjectColumnsUseCase', async () => {
    const { sut, reorderColsExecute } = makeSut();
    reorderColsExecute.mockResolvedValue([SAMPLE_COLUMN]);

    const dto = { columnIds: ['c-1'] };
    const result = await sut.reorderProjectColumns('p-1', dto);

    expect(reorderColsExecute).toHaveBeenCalledWith('p-1', dto.columnIds);
    expect(result).toEqual([SAMPLE_COLUMN]);
  });
});
