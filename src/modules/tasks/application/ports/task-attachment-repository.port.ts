import { TaskAttachment } from '../../domain/task';

export const TASK_ATTACHMENT_REPOSITORY_PORT =
  'TASK_ATTACHMENT_REPOSITORY_PORT';

export interface TaskAttachmentRepositoryPort {
  save(attachment: TaskAttachment): Promise<void>;
  findById(id: string): Promise<TaskAttachment | null>;
  delete(id: string): Promise<void>;
  findByTaskId(taskId: string): Promise<TaskAttachment[]>;
}
