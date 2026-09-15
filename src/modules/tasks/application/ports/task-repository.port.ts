import type {
  Prioridade,
  StatusTarefa,
  Task,
  TaskActivityConfirmation,
  TipoTask,
} from '../../domain/task';

export const TASK_REPOSITORY_PORT = 'TASK_REPOSITORY_PORT';

export interface FindTasksFilter {
  projetoId?: string;
  columnId?: string;
  status?: StatusTarefa;
  tipo?: TipoTask;
  appointmentId?: string;
  clienteId?: string;
  parentId?: string;
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
  tipo?: TipoTask;
  appointmentId?: string | null;
  clienteId?: string | null;
  prioridade?: Prioridade;
  progresso?: number;
  tags?: string[];
  prazo?: Date | null;
  estimativaH?: number | null;
  assigneeId?: string | null;
  parentId?: string | null;
  referenceNumber?: number | null;
  referenceCode?: string | null;
}

export interface UpdateTaskData {
  projetoId?: string;
  columnId?: string | null;
  titulo?: string;
  descricao?: string | null;
  status?: StatusTarefa;
  tipo?: TipoTask;
  prioridade?: Prioridade;
  progresso?: number;
  tags?: string[];
  prazo?: Date | null;
  estimativaH?: number | null;
  assigneeId?: string | null;
  clienteId?: string | null;
}

export interface ConfirmActivityRepoData {
  confirmedById: string;
  confirmedAt: Date;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface TaskRepositoryPort {
  findMany(filter: FindTasksFilter): Promise<{ data: Task[]; total: number }>;
  findById(id: string): Promise<Task | null>;
  findByAppointmentId(appointmentId: string): Promise<Task | null>;
  create(data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
  confirmActivity(
    taskId: string,
    data: ConfirmActivityRepoData,
  ): Promise<TaskActivityConfirmation>;
  findConfirmationByTaskId(
    taskId: string,
  ): Promise<TaskActivityConfirmation | null>;
  syncParentProgress(parentId: string): Promise<void>;
}
