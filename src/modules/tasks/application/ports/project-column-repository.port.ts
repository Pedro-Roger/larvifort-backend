import type { ProjectColumn } from '../../domain/task';

export const PROJECT_COLUMN_REPOSITORY_PORT = 'PROJECT_COLUMN_REPOSITORY_PORT';

export interface CreateProjectColumnData {
  projetoId: string;
  title: string;
  order?: number;
  color?: string | null;
}

export interface UpdateProjectColumnData {
  title?: string;
  order?: number;
  color?: string | null;
}

export interface ProjectColumnRepositoryPort {
  findByProjectId(projetoId: string): Promise<ProjectColumn[]>;
  findById(id: string): Promise<ProjectColumn | null>;
  create(data: CreateProjectColumnData): Promise<ProjectColumn>;
  update(id: string, data: UpdateProjectColumnData): Promise<ProjectColumn>;
  delete(id: string): Promise<void>;
  reorder(projetoId: string, columnIds: string[]): Promise<ProjectColumn[]>;
}
