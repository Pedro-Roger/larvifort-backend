import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TASK_ATTACHMENT_REPOSITORY_PORT,
  TaskAttachmentRepositoryPort,
} from './ports/task-attachment-repository.port';
import { FILE_STORAGE_PORT, FileStoragePort } from './ports/file-storage.port';

@Injectable()
export class DeleteTaskAttachmentUseCase {
  constructor(
    @Inject(TASK_ATTACHMENT_REPOSITORY_PORT)
    private readonly attachmentRepository: TaskAttachmentRepositoryPort,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(taskId: string, attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(attachmentId);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    if (attachment.taskId !== taskId) {
      throw new NotFoundException('Attachment not found');
    }

    await this.fileStorage.delete(attachment.path);
    await this.attachmentRepository.delete(attachmentId);
  }
}
