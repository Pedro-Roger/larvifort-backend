// TASK 06 — entidades puras de domínio para Tarefas (Kanban) e Projetos.
// Espelha os modelos Task e Projeto do schema Prisma sem importar @prisma/client.
export type StatusTarefa =
  'BACKLOG' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDO';

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Task {
  id: string;
  projetoId: string;
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
  createdAt: Date;
  updatedAt: Date;
}
