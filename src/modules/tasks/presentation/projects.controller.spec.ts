import { ProjectsController } from './projects.controller';
import type { ListProjectsUseCase } from '../application/list-projects.usecase';
import type { GetProjectByIdUseCase } from '../application/get-project-by-id.usecase';
import type { CreateProjectUseCase } from '../application/create-project.usecase';
import type { UpdateProjectUseCase } from '../application/update-project.usecase';
import type { DeleteProjectUseCase } from '../application/delete-project.usecase';
import type { Project } from '../domain/task';

describe('ProjectsController', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();

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

    const sut = new ProjectsController(
      listProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
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
});
