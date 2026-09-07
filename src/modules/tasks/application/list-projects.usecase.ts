import { Inject, Injectable } from '@nestjs/common';
import type { Project } from '../domain/task';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
  ) {}

  async execute(): Promise<Project[]> {
    return this.projects.findAll();
  }
}
