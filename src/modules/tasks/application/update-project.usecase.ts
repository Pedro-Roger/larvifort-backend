import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Project } from '../domain/task';
import type {
  ProjectRepositoryPort,
  UpdateProjectData,
} from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateProjectData): Promise<Project> {
    const existing = await this.projects.findById(id);
    if (!existing) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (name && name !== existing.name) {
        const projectWithName = await this.projects.findByName(name);
        if (projectWithName && projectWithName.id !== id) {
          throw new ConflictException('Nome de projeto já cadastrado.');
        }
      }
    }

    return this.projects.update(id, input);
  }
}
