import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListTasksUseCase } from './application/list-tasks.usecase';
import { GetTaskByIdUseCase } from './application/get-task-by-id.usecase';
import { CreateTaskUseCase } from './application/create-task.usecase';
import { UpdateTaskUseCase } from './application/update-task.usecase';
import { UpdateTaskStatusUseCase } from './application/update-task-status.usecase';
import { DeleteTaskUseCase } from './application/delete-task.usecase';
import { ListProjectsUseCase } from './application/list-projects.usecase';
import { UploadTaskAttachmentUseCase } from './application/upload-task-attachment.usecase';
import { ListTaskAttachmentsUseCase } from './application/list-task-attachments.usecase';
import { DeleteTaskAttachmentUseCase } from './application/delete-task-attachment.usecase';
import { FILE_STORAGE_PORT } from './application/ports/file-storage.port';
import { GetProjectByIdUseCase } from './application/get-project-by-id.usecase';
import { CreateProjectUseCase } from './application/create-project.usecase';
import { UpdateProjectUseCase } from './application/update-project.usecase';
import { DeleteProjectUseCase } from './application/delete-project.usecase';
import { ListProjectColumnsUseCase } from './application/list-project-columns.usecase';
import { CreateProjectColumnUseCase } from './application/create-project-column.usecase';
import { UpdateProjectColumnUseCase } from './application/update-project-column.usecase';
import { DeleteProjectColumnUseCase } from './application/delete-project-column.usecase';
import { ReorderProjectColumnsUseCase } from './application/reorder-project-columns.usecase';
import { ListProjectTemplatesUseCase } from './application/list-project-templates.usecase';
import { GetProjectTemplateByIdUseCase } from './application/get-project-template-by-id.usecase';
import { ConfirmTaskActivityUseCase } from './application/confirm-task-activity.usecase';
import { TASK_REPOSITORY_PORT } from './application/ports/task-repository.port';
import { TASK_ATTACHMENT_REPOSITORY_PORT } from './application/ports/task-attachment-repository.port';
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
import {
  PRISMA_TASK_ATTACHMENTS_TOKEN,
  TaskAttachmentPrismaRepository,
} from './infra/task-attachment.prisma.repository';
import { TasksController } from './presentation/tasks.controller';
import { ProjectsController } from './presentation/projects.controller';
import { BoardColumnsController } from './presentation/board-columns.controller';
import { BoardTemplatesController } from './presentation/board-templates.controller';
import { TaskTransferController } from './presentation/task-transfer.controller';
import { TaskAttachmentsController } from './presentation/task-attachments.controller';
import { LocalFileStorage } from './infra/local-file-storage';
import { RulesModule } from '../rules/rules.module';
import { EventsModule } from '../events/events.module';
import { EventsService } from '../events/events.service';
import { CreateSubtaskUseCase } from './application/create-subtask.usecase';
import { ListSubtasksUseCase } from './application/list-subtasks.usecase';
import { UpdateSubtaskUseCase } from './application/update-subtask.usecase';
import { DeleteSubtaskUseCase } from './application/delete-subtask.usecase';

@Module({
  imports: [RulesModule, EventsModule],
  controllers: [
    TasksController,
    ProjectsController,
    BoardColumnsController,
    BoardTemplatesController,
    TaskTransferController,
    TaskAttachmentsController,
  ],
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
    ListProjectTemplatesUseCase,
    GetProjectTemplateByIdUseCase,
    ConfirmTaskActivityUseCase,
    UploadTaskAttachmentUseCase,
    ListTaskAttachmentsUseCase,
    DeleteTaskAttachmentUseCase,
    CreateSubtaskUseCase,
    ListSubtasksUseCase,
    UpdateSubtaskUseCase,
    DeleteSubtaskUseCase,
    PrismaTaskRepository,
    PrismaProjectRepository,
    PrismaProjectColumnRepository,
    TaskAttachmentPrismaRepository,
    { provide: PRISMA_TASKS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_PROJECTS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_PROJECT_COLUMNS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_TASK_ATTACHMENTS_TOKEN, useExisting: PrismaService },
    { provide: TASK_REPOSITORY_PORT, useClass: PrismaTaskRepository },
    { provide: PROJECT_REPOSITORY_PORT, useClass: PrismaProjectRepository },
    {
      provide: PROJECT_COLUMN_REPOSITORY_PORT,
      useClass: PrismaProjectColumnRepository,
    },
    {
      provide: TASK_ATTACHMENT_REPOSITORY_PORT,
      useClass: TaskAttachmentPrismaRepository,
    },
    LocalFileStorage,
    { provide: FILE_STORAGE_PORT, useExisting: LocalFileStorage },
    EventsService,
  ],
  exports: [
    TASK_REPOSITORY_PORT,
    TASK_ATTACHMENT_REPOSITORY_PORT,
    PROJECT_REPOSITORY_PORT,
    PROJECT_COLUMN_REPOSITORY_PORT,
    ListTasksUseCase,
    ListProjectsUseCase,
    ListProjectColumnsUseCase,
    CreateProjectColumnUseCase,
    UpdateProjectColumnUseCase,
    DeleteProjectColumnUseCase,
    ReorderProjectColumnsUseCase,
    ListProjectTemplatesUseCase,
    GetProjectTemplateByIdUseCase,
    ConfirmTaskActivityUseCase,
    UploadTaskAttachmentUseCase,
    ListTaskAttachmentsUseCase,
    DeleteTaskAttachmentUseCase,
  ],
})
export class TasksModule {}
