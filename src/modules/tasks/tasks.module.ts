import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListTasksUseCase } from './application/list-tasks.usecase';
import { GetTaskByIdUseCase } from './application/get-task-by-id.usecase';
import { CreateTaskUseCase } from './application/create-task.usecase';
import { UpdateTaskUseCase } from './application/update-task.usecase';
import { UpdateTaskStatusUseCase } from './application/update-task-status.usecase';
import { DeleteTaskUseCase } from './application/delete-task.usecase';
import { ListProjectsUseCase } from './application/list-projects.usecase';
import { GetProjectByIdUseCase } from './application/get-project-by-id.usecase';
import { CreateProjectUseCase } from './application/create-project.usecase';
import { UpdateProjectUseCase } from './application/update-project.usecase';
import { DeleteProjectUseCase } from './application/delete-project.usecase';
import { TASK_REPOSITORY_PORT } from './application/ports/task-repository.port';
import { PROJECT_REPOSITORY_PORT } from './application/ports/project-repository.port';
import {
  PRISMA_TASKS_TOKEN,
  PrismaTaskRepository,
} from './infra/task.prisma.repository';
import {
  PRISMA_PROJECTS_TOKEN,
  PrismaProjectRepository,
} from './infra/project.prisma.repository';
import { TasksController } from './presentation/tasks.controller';
import { ProjectsController } from './presentation/projects.controller';

@Module({
  controllers: [TasksController, ProjectsController],
  providers: [
    ListTasksUseCase,
    GetTaskByIdUseCase,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    UpdateTaskStatusUseCase,
    DeleteTaskUseCase,
    ListProjectsUseCase,
    GetProjectByIdUseCase,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    PrismaTaskRepository,
    PrismaProjectRepository,
    { provide: PRISMA_TASKS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_PROJECTS_TOKEN, useExisting: PrismaService },
    { provide: TASK_REPOSITORY_PORT, useClass: PrismaTaskRepository },
    { provide: PROJECT_REPOSITORY_PORT, useClass: PrismaProjectRepository },
  ],
  exports: [
    TASK_REPOSITORY_PORT,
    PROJECT_REPOSITORY_PORT,
    ListTasksUseCase,
    ListProjectsUseCase,
  ],
})
export class TasksModule {}
