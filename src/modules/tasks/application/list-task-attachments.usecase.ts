import { Injectable, Inject } from '@nestjs/common';
import {
  TASK_ATTACHMENT_REPOSITORY_PORT,
  TaskAttachmentRepositoryPort,
} from './ports/task-attachment-repository.port';
import { TaskAttachment } from '../domain/task';

@Injectable()
export class ListTaskAttachmentsUseCase {
  constructor(
    @Inject(TASK_ATTACHMENT_REPOSITORY_PORT)
    private readonly attachmentRepository: TaskAttachmentRepositoryPort,
  ) {}

  async execute(taskId: string): Promise<TaskAttachment[]> {
    return this.attachmentRepository.findByTaskId(taskId);
  }
}
