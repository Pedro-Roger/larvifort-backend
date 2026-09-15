import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Optional,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { Paginated } from '../../../core/common/pagination';
import { EventsService } from '../../events/events.service';
import type { Task, TaskActivityConfirmation } from '../domain/task';
import { ListTasksUseCase } from '../application/list-tasks.usecase';
import { GetTaskByIdUseCase } from '../application/get-task-by-id.usecase';
import { CreateTaskUseCase } from '../application/create-task.usecase';
import { UpdateTaskUseCase } from '../application/update-task.usecase';
import { UpdateTaskStatusUseCase } from '../application/update-task-status.usecase';
import { DeleteTaskUseCase } from '../application/delete-task.usecase';
import { ListProjectsUseCase } from '../application/list-projects.usecase';
import { ConfirmTaskActivityUseCase } from '../application/confirm-task-activity.usecase';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { ConfirmActivityDto } from './dto/confirm-activity.dto';
import { CreateSubtaskUseCase } from '../application/create-subtask.usecase';
import { ListSubtasksUseCase } from '../application/list-subtasks.usecase';
import { UpdateSubtaskUseCase } from '../application/update-subtask.usecase';
import { DeleteSubtaskUseCase } from '../application/delete-subtask.usecase';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import type { RuleRepositoryPort } from '../../rules/application/ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from '../../rules/application/ports/rule-repository.port';

// TASK 06 & FASE 6 — presentation do Tasks Module (Kanban + Confirmação de Atividade).
// Suporta rotas /tasks (GOAL) e /tarefas (SPECS).
@ApiTags('Tarefas')
@ApiBearerAuth('access-token')
@Controller(['tasks', 'tarefas'])
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly listTasks: ListTasksUseCase,
    private readonly getTaskById: GetTaskByIdUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly updateTaskStatus: UpdateTaskStatusUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
    private readonly listProjects: ListProjectsUseCase,
    private readonly confirmTaskActivity: ConfirmTaskActivityUseCase,
    @Optional()
    private readonly createSubtask?: CreateSubtaskUseCase,
    @Optional()
    private readonly listSubtasks?: ListSubtasksUseCase,
    @Optional()
    private readonly updateSubtask?: UpdateSubtaskUseCase,
    @Optional()
    private readonly deleteSubtask?: DeleteSubtaskUseCase,
    @Optional()
    private readonly events?: EventsService,
    @Optional()
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules?: RuleRepositoryPort,
  ) {}

  @Get()
  async findMany(
    @Query() query: FindTasksQueryDto,
    @CurrentUser()
    user?: { id: string; role: 'ADMIN' | 'USER'; teamId: string | null },
  ): Promise<Paginated<Task>> {
    // A permissão de visualização é aplicada no backend para não depender do filtro da UI.
    let scopedQuery = query;
    if (user?.role === 'USER') {
      let viewAll = false;
      if (query.projetoId && this.rules) {
        const configured = await this.rules.findMany({
          projectId: query.projetoId,
          active: true,
          page: 1,
          limit: 100,
        });
        viewAll = configured.data.some((rule) => {
          const config = rule.parameters.config;
          return (
            rule.parameters.ruleType === 'VIEW_SCOPE' &&
            config &&
            typeof config === 'object' &&
            (config as Record<string, unknown>).mode === 'ALL'
          );
        });
      }
      if (!viewAll) scopedQuery = { ...query, assigneeId: user.id };
    }
    return this.listTasks.execute(scopedQuery);
  }

  @Get('projects')
  findProjects() {
    return this.listProjects.execute();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Task> {
    return this.getTaskById.execute(id);
  }

  @Get(':id/subtasks')
  listTaskSubtasks(@Param('id') id: string): Promise<Task[]> {
    const useCase = this.listSubtasks;
    if (!useCase) return Promise.resolve([]);
    return useCase.execute(id);
  }

  @Post(':id/subtasks')
  createTaskSubtask(
    @Param('id') id: string,
    @Body() dto: CreateSubtaskDto,
  ): Promise<Task> {
    const useCase = this.createSubtask;
    if (!useCase) {
      throw new Error('CreateSubtaskUseCase not available');
    }
    return useCase.execute(id, dto);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateTaskSubtask(
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
  ): Promise<Task> {
    const useCase = this.updateSubtask;
    if (!useCase) {
      throw new Error('UpdateSubtaskUseCase not available');
    }
    return useCase.execute(subtaskId, dto);
  }

  @Delete(':id/subtasks/:subtaskId')
  @HttpCode(204)
  deleteTaskSubtask(@Param('subtaskId') subtaskId: string): Promise<void> {
    const useCase = this.deleteSubtask;
    if (!useCase) return Promise.resolve();
    return useCase.execute(subtaskId);
  }

  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    const task = await this.createTask.execute(dto);
    this.events?.emitTaskCreated(task.projetoId, task);
    return task;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.updateTask.execute(id, dto);
    this.events?.emitTaskUpdated(task.projetoId, task);
    return task;
  }

  @Patch([':id/status', ':id/mover'])
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser()
    user: { id: string; role: 'ADMIN' | 'USER'; teamId: string | null },
  ): Promise<Task> {
    const task = await this.updateTaskStatus.execute(id, dto, user);
    this.events?.emitTaskMoved(task.projetoId, {
      taskId: task.id,
      fromStatus: dto.status,
      toStatus: dto.status,
      columnId: task.columnId,
    });
    this.events?.emitTaskUpdated(task.projetoId, task);
    return task;
  }

  @Patch(':id/progresso')
  async updateProgresso(
    @Param('id') id: string,
    @Body('progresso') progresso: number,
  ): Promise<Task> {
    const task = await this.updateTask.execute(id, { progresso });
    this.events?.emitTaskUpdated(task.projetoId, task);
    return task;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    const task = await this.getTaskById.execute(id);
    await this.deleteTask.execute(id);
    this.events?.emitTaskDeleted(task.projetoId, task.id);
  }

  @Post([':id/confirm-activity', ':id/checkin'])
  @ApiOperation({
    summary:
      'Confirmar atividade com usuário, horário do servidor e geolocalização',
    description:
      'Somente tasks tipo COMPROMISSO. Grava confirmedAt do servidor, confirmedById do JWT e coordenadas enviadas. Retorna 409 em repetição, 400 para tarefa GERAL ou coordenadas inválidas, 403 sem permissão.',
  })
  confirmActivity(
    @Param('id') id: string,
    @Body() dto: ConfirmActivityDto,
    @CurrentUser()
    user: { id: string; role: 'ADMIN' | 'USER' },
  ): Promise<TaskActivityConfirmation> {
    return this.confirmTaskActivity.execute(id, dto, user);
  }
}
