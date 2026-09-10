import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProjectColumn } from '../domain/task';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';
import type {
  CreateProjectColumnData,
  ProjectColumnRepositoryPort,
} from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';

export type CreateColumnInput = Omit<CreateProjectColumnData, 'projetoId'>;

@Injectable()
export class CreateProjectColumnUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
  ) {}

  async execute(
    projectId: string,
    dto: CreateColumnInput,
  ): Promise<ProjectColumn> {
    const project = await this.projects.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    const title = dto.title?.trim();
    if (!title) {
      throw new BadRequestException('Título da coluna é obrigatório.');
    }

    return this.columns.create({
      projetoId: projectId,
      title,
      order: dto.order,
      color: dto.color,
    });
  }
}
