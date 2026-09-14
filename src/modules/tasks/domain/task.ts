// TASK 06 & FASE 5 — entidades puras de domínio para Tarefas (Kanban), Projetos e Colunas.
// Espelha os modelos Task, Projeto e ProjetoColumn do schema Prisma sem importar @prisma/client.
export type StatusTarefa =
  'BACKLOG' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDO';

export type TipoTask = 'GERAL' | 'COMPROMISSO';

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface TaskActivityConfirmation {
  id: string;
  taskId: string;
  confirmedById: string;
  confirmedAt: Date;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  createdAt: Date;
}

export interface ProjectColumn {
  id: string;
  projetoId: string;
  title: string;
  order: number;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projetoId: string;
  columnId?: string | null;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  tipo?: TipoTask;
  appointmentId?: string | null;
  clienteId?: string | null;
  confirmation?: TaskActivityConfirmation | null;
  prioridade: Prioridade;
  progresso: number;
  tags: string[];
  prazo: Date | null;
  estimativaH: number | null;
  assigneeId: string | null;
  assignee?: { firstName: string; lastName: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  teamId?: string | null;
  responsibleId?: string | null;
  teamName?: string | null;
  responsibleName?: string | null;
  columns?: ProjectColumn[];
  createdAt: Date;
  updatedAt: Date;
}
