import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';

@Injectable()
export class DeleteProjectColumnUseCase {
  constructor(
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
  ) {}

  async execute(columnId: string): Promise<void> {
    const column = await this.columns.findById(columnId);
    if (!column) {
      throw new NotFoundException('Coluna não encontrada.');
    }

    await this.columns.delete(columnId);
  }
}
