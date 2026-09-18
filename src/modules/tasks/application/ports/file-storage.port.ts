export const FILE_STORAGE_PORT = 'FILE_STORAGE_PORT';

export interface FileStoragePort {
  upload(
    file: Express.Multer.File,
  ): Promise<{ path: string; size: number; mimeType: string }>;
  delete(path: string): Promise<void>;
}
