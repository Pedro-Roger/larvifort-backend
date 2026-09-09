import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Task } from '../domain/task';
import { ListTasksUseCase } from '../application/list-tasks.usecase';
import { GetTaskByIdUseCase } from '../application/get-task-by-id.usecase';
import { CreateTaskUseCase } from '../application/create-task.usecase';
import { UpdateTaskUseCase } from '../application/update-task.usecase';
import { UpdateTaskStatusUseCase } from '../application/update-task-status.usecase';
import { DeleteTaskUseCase } from '../application/delete-task.usecase';
import { ListProjectsUseCase } from '../application/list-projects.usecase';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

// TASK 06 — presentation do Tasks Module (Kanban).
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
  ) {}

  @Get()
  findMany(@Query() query: FindTasksQueryDto): Promise<Paginated<Task>> {
    return this.listTasks.execute(query);
  }

  @Get('projects')
  findProjects() {
    return this.listProjects.execute();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Task> {
    return this.getTaskById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.createTask.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.updateTask.execute(id, dto);
  }

  @Patch([':id/status', ':id/mover'])
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.updateTaskStatus.execute(id, dto);
  }

  @Patch(':id/progresso')
  updateProgresso(
    @Param('id') id: string,
    @Body('progresso') progresso: number,
  ): Promise<Task> {
    return this.updateTask.execute(id, { progresso });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteTask.execute(id);
  }
}
