import type { Prioridade, StatusTarefa, Task } from '../../domain/task';

export const TASK_REPOSITORY_PORT = 'TASK_REPOSITORY_PORT';

export interface FindTasksFilter {
  projetoId?: string;
  columnId?: string;
  status?: StatusTarefa;
  assigneeId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateTaskData {
  projetoId: string;
  columnId?: string | null;
  titulo: string;
  descricao?: string | null;
  status?: StatusTarefa;
  prioridade?: Prioridade;
  progresso?: number;
  tags?: string[];
  prazo?: Date | null;
  estimativaH?: number | null;
  assigneeId?: string | null;
}

export interface UpdateTaskData {
  projetoId?: string;
  columnId?: string | null;
  titulo?: string;
  descricao?: string | null;
  status?: StatusTarefa;
  prioridade?: Prioridade;
  progresso?: number;
  tags?: string[];
  prazo?: Date | null;
  estimativaH?: number | null;
  assigneeId?: string | null;
}

export interface TaskRepositoryPort {
  findMany(filter: FindTasksFilter): Promise<{ data: Task[]; total: number }>;
  findById(id: string): Promise<Task | null>;
  create(data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}
