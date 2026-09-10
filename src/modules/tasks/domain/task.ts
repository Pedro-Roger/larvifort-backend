// TASK 06 & FASE 5 — entidades puras de domínio para Tarefas (Kanban), Projetos e Colunas.
// Espelha os modelos Task, Projeto e ProjetoColumn do schema Prisma sem importar @prisma/client.
export type StatusTarefa =
  'BACKLOG' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDO';

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

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
  prioridade: Prioridade;
  progresso: number;
  tags: string[];
  prazo: Date | null;
  estimativaH: number | null;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  columns?: ProjectColumn[];
  createdAt: Date;
  updatedAt: Date;
}
