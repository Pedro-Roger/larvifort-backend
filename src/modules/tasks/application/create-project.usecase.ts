import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Project } from '../domain/task';
import type {
  CreateProjectData,
  ProjectRepositoryPort,
} from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
  ) {}

  async execute(input: CreateProjectData): Promise<Project> {
    const existing = await this.projects.findByName(input.name.trim());
    if (existing) {
      throw new ConflictException('Nome de projeto já cadastrado.');
    }

    return this.projects.create(input);
  }
}
