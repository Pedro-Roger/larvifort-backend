import { Inject, Injectable } from '@nestjs/common';
import { TaskAttachment } from '../domain/task';
import { TaskAttachmentRepositoryPort } from '../application/ports/task-attachment-repository.port';

export const PRISMA_TASK_ATTACHMENTS_TOKEN = 'PRISMA_TASK_ATTACHMENTS_TOKEN';

interface PrismaTaskAttachmentCrud {
  taskAttachment: {
    create(args: { data: Omit<TaskAttachment, 'createdAt'> }): Promise<unknown>;
    findUnique(args: { where: { id: string } }): Promise<TaskAttachment | null>;
    delete(args: { where: { id: string } }): Promise<unknown>;
    findMany(args: { where: { taskId: string } }): Promise<TaskAttachment[]>;
  };
}

@Injectable()
export class TaskAttachmentPrismaRepository implements TaskAttachmentRepositoryPort {
  constructor(
    @Inject(PRISMA_TASK_ATTACHMENTS_TOKEN)
    private readonly prisma: PrismaTaskAttachmentCrud,
  ) {}

  async save(attachment: TaskAttachment): Promise<void> {
    await this.prisma.taskAttachment.create({
      data: {
        id: attachment.id,
        taskId: attachment.taskId,
        filename: attachment.filename,
        path: attachment.path,
        mimeType: attachment.mimeType,
        size: attachment.size,
      },
    });
  }

  async findById(id: string): Promise<TaskAttachment | null> {
    return this.prisma.taskAttachment.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taskAttachment.delete({ where: { id } });
  }

  async findByTaskId(taskId: string): Promise<TaskAttachment[]> {
    return this.prisma.taskAttachment.findMany({ where: { taskId } });
  }
}
