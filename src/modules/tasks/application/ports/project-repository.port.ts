import type { Project } from '../../domain/task';

export const PROJECT_REPOSITORY_PORT = 'PROJECT_REPOSITORY_PORT';

export interface CreateProjectData {
  name: string;
}

export interface UpdateProjectData {
  name?: string;
}

export interface ProjectRepositoryPort {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  create(data: CreateProjectData): Promise<Project>;
  update(id: string, data: UpdateProjectData): Promise<Project>;
  delete(id: string): Promise<void>;
}
