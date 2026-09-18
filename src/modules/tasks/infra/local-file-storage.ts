import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FileStoragePort } from '../application/ports/file-storage.port';

@Injectable()
export class LocalFileStorage implements FileStoragePort {
  private readonly root =
    process.env.TASK_ATTACHMENTS_DIR ??
    join(process.cwd(), 'storage', 'task-attachments');

  async upload(file: Express.Multer.File) {
    await mkdir(this.root, { recursive: true });
    const filename = `${randomUUID()}-${basename(file.originalname)}`;
    const path = join(this.root, filename);
    await writeFile(path, file.buffer);
    return { path, size: file.size, mimeType: file.mimetype };
  }

  async delete(path: string): Promise<void> {
    await unlink(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
