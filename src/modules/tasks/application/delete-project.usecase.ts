import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.projects.findById(id);
    if (!existing) {
      throw new NotFoundException('Projeto não encontrado.');
    }
    await this.projects.delete(id);
  }
}
