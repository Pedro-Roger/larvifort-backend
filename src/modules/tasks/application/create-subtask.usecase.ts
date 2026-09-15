import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

export interface CreateSubtaskData {
  titulo: string;
  descricao?: string | null;
  assigneeId?: string | null;
}

@Injectable()
export class CreateSubtaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(parentId: string, input: CreateSubtaskData): Promise<Task> {
    const parent = await this.tasks.findById(parentId);
    if (!parent) throw new NotFoundException('Tarefa principal não encontrada.');
    if (parent.parentId) {
      throw new BadRequestException('Não é permitido criar subtarefa de uma subtarefa.');
    }
    if (!input.titulo.trim()) {
      throw new BadRequestException('Título da subtarefa é obrigatório.');
    }

    const child = await this.tasks.create({
      projetoId: parent.projetoId,
      columnId: parent.columnId,
      titulo: input.titulo,
      descricao: input.descricao,
      assigneeId: input.assigneeId,
      parentId,
      status: 'BACKLOG',
      progresso: 0,
    });
    await this.tasks.syncParentProgress(parentId);
    return child;
  }
}
