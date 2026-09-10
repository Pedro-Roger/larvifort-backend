import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProjectColumn } from '../domain/task';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';

@Injectable()
export class ReorderProjectColumnsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
  ) {}

  async execute(
    projectId: string,
    columnIds: string[],
  ): Promise<ProjectColumn[]> {
    const project = await this.projects.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    if (!Array.isArray(columnIds) || columnIds.length === 0) {
      throw new BadRequestException('Lista de IDs de colunas é obrigatória.');
    }

    return this.columns.reorder(projectId, columnIds);
  }
}
