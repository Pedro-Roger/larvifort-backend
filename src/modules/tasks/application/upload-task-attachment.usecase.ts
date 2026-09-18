import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TASK_REPOSITORY_PORT,
  TaskRepositoryPort,
} from './ports/task-repository.port';
import {
  TASK_ATTACHMENT_REPOSITORY_PORT,
  TaskAttachmentRepositoryPort,
} from './ports/task-attachment-repository.port';
import { FILE_STORAGE_PORT, FileStoragePort } from './ports/file-storage.port';
import { TaskAttachment } from '../domain/task';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadTaskAttachmentUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly taskRepository: TaskRepositoryPort,
    @Inject(TASK_ATTACHMENT_REPOSITORY_PORT)
    private readonly attachmentRepository: TaskAttachmentRepositoryPort,
    @Inject(FILE_STORAGE_PORT) private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(
    taskId: string,
    file: Express.Multer.File,
  ): Promise<TaskAttachment> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { path, size, mimeType } = await this.fileStorage.upload(file);

    const attachment: TaskAttachment = {
      id: randomUUID(),
      taskId,
      filename: file.originalname,
      path,
      mimeType,
      size,
      createdAt: new Date(),
    };

    await this.attachmentRepository.save(attachment);
    return attachment;
  }
}
