import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { GetTaskByIdUseCase } from '../application/get-task-by-id.usecase';
import { CreateTaskUseCase } from '../application/create-task.usecase';
import { UpdateTaskUseCase } from '../application/update-task.usecase';
import type { Task } from '../domain/task';

export interface TransferTaskDto {
  targetBoardId: string;
  targetColumnId?: string;
  mode: 'MOVE' | 'CHILD_TASK';
  note?: string;
}

@ApiTags('Passagem de Bastão')
@ApiBearerAuth('access-token')
@Controller('tasks/:taskId/transfer')
@UseGuards(JwtAuthGuard)
export class TaskTransferController {
  constructor(
    private readonly getTaskById: GetTaskByIdUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Transferir ou desmembrar tarefa entre quadros' })
  async transfer(
    @Param('taskId') taskId: string,
    @Body() dto: TransferTaskDto,
  ): Promise<{ originalTask: Task; targetTask?: Task }> {
    const original = await this.getTaskById.execute(taskId);
    if (!original) {
      throw new NotFoundException('Tarefa de origem não encontrada.');
    }

    if (dto.mode === 'MOVE') {
      const moved = await this.updateTask.execute(taskId, {
        projetoId: dto.targetBoardId,
        columnId: dto.targetColumnId ?? null,
      });
      return { originalTask: moved };
    }

    // mode === 'CHILD_TASK'
    const target = await this.createTask.execute({
      projetoId: dto.targetBoardId,
      columnId: dto.targetColumnId ?? undefined,
      titulo: `${original.titulo} (Desmembrada)`,
      descricao: dto.note
        ? `${original.descricao ?? ''}\nNota de transferência: ${dto.note}`
        : (original.descricao ?? undefined),
      prioridade: original.prioridade,
    });

    return { originalTask: original, targetTask: target };
  }
}
