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
import { ListProjectColumnsUseCase } from './application/list-project-columns.usecase';
import { CreateProjectColumnUseCase } from './application/create-project-column.usecase';
import { UpdateProjectColumnUseCase } from './application/update-project-column.usecase';
import { DeleteProjectColumnUseCase } from './application/delete-project-column.usecase';
import { ReorderProjectColumnsUseCase } from './application/reorder-project-columns.usecase';
import { TASK_REPOSITORY_PORT } from './application/ports/task-repository.port';
import { PROJECT_REPOSITORY_PORT } from './application/ports/project-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './application/ports/project-column-repository.port';
import {
  PRISMA_TASKS_TOKEN,
  PrismaTaskRepository,
} from './infra/task.prisma.repository';
import {
  PRISMA_PROJECTS_TOKEN,
  PrismaProjectRepository,
} from './infra/project.prisma.repository';
import {
  PRISMA_PROJECT_COLUMNS_TOKEN,
  PrismaProjectColumnRepository,
} from './infra/project-column.prisma.repository';
import { TasksController } from './presentation/tasks.controller';
import { ProjectsController } from './presentation/projects.controller';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [RulesModule],
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
    ListProjectColumnsUseCase,
    CreateProjectColumnUseCase,
    UpdateProjectColumnUseCase,
    DeleteProjectColumnUseCase,
    ReorderProjectColumnsUseCase,
    PrismaTaskRepository,
    PrismaProjectRepository,
    PrismaProjectColumnRepository,
    { provide: PRISMA_TASKS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_PROJECTS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_PROJECT_COLUMNS_TOKEN, useExisting: PrismaService },
    { provide: TASK_REPOSITORY_PORT, useClass: PrismaTaskRepository },
    { provide: PROJECT_REPOSITORY_PORT, useClass: PrismaProjectRepository },
    {
      provide: PROJECT_COLUMN_REPOSITORY_PORT,
      useClass: PrismaProjectColumnRepository,
    },
  ],
  exports: [
    TASK_REPOSITORY_PORT,
    PROJECT_REPOSITORY_PORT,
    PROJECT_COLUMN_REPOSITORY_PORT,
    ListTasksUseCase,
    ListProjectsUseCase,
    ListProjectColumnsUseCase,
    CreateProjectColumnUseCase,
    UpdateProjectColumnUseCase,
    DeleteProjectColumnUseCase,
    ReorderProjectColumnsUseCase,
  ],
})
export class TasksModule {}
