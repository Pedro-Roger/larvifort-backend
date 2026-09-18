import { NotFoundException } from '@nestjs/common';
import { DeleteTaskAttachmentUseCase } from './delete-task-attachment.usecase';
import type { TaskAttachmentRepositoryPort } from './ports/task-attachment-repository.port';
import type { FileStoragePort } from './ports/file-storage.port';

describe('DeleteTaskAttachmentUseCase', () => {
  it('deletes only when the attachment belongs to the task in the route', async () => {
    const deleteAttachment = jest.fn();
    const deleteStoredFile = jest.fn();
    const repository: jest.Mocked<TaskAttachmentRepositoryPort> = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        id: 'a1',
        taskId: 'task-1',
        filename: 'x.txt',
        path: '/tmp/x',
        mimeType: 'text/plain',
        size: 1,
        createdAt: new Date(),
      }),
      delete: deleteAttachment,
      findByTaskId: jest.fn(),
    };
    const storage: jest.Mocked<FileStoragePort> = {
      upload: jest.fn(),
      delete: deleteStoredFile,
    };
    const useCase = new DeleteTaskAttachmentUseCase(repository, storage);

    await expect(useCase.execute('task-2', 'a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(deleteStoredFile).not.toHaveBeenCalled();
    expect(deleteAttachment).not.toHaveBeenCalled();

    await useCase.execute('task-1', 'a1');
    expect(deleteStoredFile).toHaveBeenCalledWith('/tmp/x');
    expect(deleteAttachment).toHaveBeenCalledWith('a1');
  });
});
