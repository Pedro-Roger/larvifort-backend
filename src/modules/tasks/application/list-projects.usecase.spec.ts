import { ListProjectsUseCase } from './list-projects.usecase';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import type { Project } from '../domain/task';

describe('ListProjectsUseCase', () => {
  const SAMPLE_PROJECT: Project = {
    id: 'p-1',
    name: 'LarviFort CRM',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna lista de projetos', async () => {
    const findAll = jest.fn().mockResolvedValue([SAMPLE_PROJECT]);
    const projects = { findAll } as unknown as ProjectRepositoryPort;
    const sut = new ListProjectsUseCase(projects);

    const result = await sut.execute();

    expect(findAll).toHaveBeenCalled();
    expect(result).toEqual([SAMPLE_PROJECT]);
  });
});
