import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Project } from '../domain/task';
import { PROJECT_TEMPLATES } from '../domain/project-template';
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
    let resolvedColumns = input.columns;

    if (input.templateId) {
      const template = PROJECT_TEMPLATES.find((t) => t.id === input.templateId);
      if (!template) {
        throw new NotFoundException('Template de projeto não encontrado.');
      }
      if (
        !resolvedColumns &&
        (!input.initialColumns || input.initialColumns.length === 0)
      ) {
        resolvedColumns = template.columns.map((c) => ({
          name: c.name,
          color: c.color,
          order: c.order,
        }));
      }
    }

    const existing = await this.projects.findByName(input.name.trim());
    if (existing) {
      throw new ConflictException('Nome de projeto já cadastrado.');
    }

    return this.projects.create({
      ...input,
      columns: resolvedColumns,
    });
  }
}
