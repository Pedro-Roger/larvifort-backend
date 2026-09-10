import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectColumn } from '../domain/task';
import type {
  ProjectColumnRepositoryPort,
  UpdateProjectColumnData,
} from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';

@Injectable()
export class UpdateProjectColumnUseCase {
  constructor(
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
  ) {}

  async execute(
    columnId: string,
    dto: UpdateProjectColumnData,
  ): Promise<ProjectColumn> {
    const column = await this.columns.findById(columnId);
    if (!column) {
      throw new NotFoundException('Coluna não encontrada.');
    }

    return this.columns.update(columnId, {
      title: dto.title !== undefined ? dto.title.trim() : undefined,
      order: dto.order,
      color: dto.color,
    });
  }
}
