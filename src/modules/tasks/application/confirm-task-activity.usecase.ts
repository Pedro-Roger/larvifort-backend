import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TaskActivityConfirmation } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

export interface ConfirmActivityInput {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface ConfirmingUser {
  id: string;
  role: 'ADMIN' | 'USER';
}

@Injectable()
export class ConfirmTaskActivityUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasksRepo: TaskRepositoryPort,
  ) {}

  async execute(
    taskId: string,
    input: ConfirmActivityInput,
    user: ConfirmingUser,
  ): Promise<TaskActivityConfirmation> {
    const task = await this.tasksRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    if (task.tipo !== 'COMPROMISSO') {
      throw new BadRequestException(
        'Somente tarefas de compromisso podem ser confirmadas.',
      );
    }

    const existingConfirmation =
      await this.tasksRepo.findConfirmationByTaskId(taskId);
    if (existingConfirmation || task.confirmation) {
      throw new ConflictException(
        'Esta atividade já foi confirmada anteriormente.',
      );
    }

    // Permissão: responsável da task ou ADMIN podem confirmar
    if (
      task.assigneeId &&
      task.assigneeId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para confirmar esta atividade.',
      );
    }

    const confirmedAt = new Date(); // Horário oficial do servidor

    return this.tasksRepo.confirmActivity(taskId, {
      confirmedById: user.id,
      confirmedAt,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracyMeters: input.accuracyMeters,
    });
  }
}
