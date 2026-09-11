// FASE 5 - API-010 — Entidade pura e catálogo canônico de Templates de Projeto.
// Templates opt-in contêm apenas configuração de colunas/cores, sem dados acoplados a ambientes.

export interface ProjectTemplateColumn {
  name: string;
  color?: string | null;
  order: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  columns: ProjectTemplateColumn[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'vazio',
    name: 'Vazio / Em Branco',
    description:
      'Quadro em branco com coluna inicial para montar a estrutura do zero.',
    columns: [{ name: 'A Fazer', color: '#64748b', order: 0 }],
  },
  {
    id: 'pipeline-comercial',
    name: 'Pipeline Comercial',
    description:
      'Funil de vendas para prospecção, qualificação, proposta e fechamento.',
    columns: [
      { name: 'Prospecção', color: '#3b82f6', order: 0 },
      { name: 'Contato Feito', color: '#8b5cf6', order: 1 },
      { name: 'Proposta Enviada', color: '#f59e0b', order: 2 },
      { name: 'Negociação', color: '#ec4899', order: 3 },
      { name: 'Fechado', color: '#10b981', order: 4 },
      { name: 'Perdido', color: '#ef4444', order: 5 },
    ],
  },
  {
    id: 'atendimento',
    name: 'Atendimento de Clientes',
    description:
      'Gestão de tickets, suporte técnico e resolução de solicitações de clientes.',
    columns: [
      { name: 'Novos', color: '#0ea5e9', order: 0 },
      { name: 'Em Atendimento', color: '#8b5cf6', order: 1 },
      { name: 'Aguardando Cliente', color: '#f59e0b', order: 2 },
      { name: 'Resolvidos', color: '#10b981', order: 3 },
    ],
  },
  {
    id: 'operacoes',
    name: 'Operações e Produção',
    description:
      'Acompanhamento do fluxo operacional, preparação de pedidos, execução e inspeção.',
    columns: [
      { name: 'A Fazer', color: '#64748b', order: 0 },
      { name: 'Em Preparação', color: '#0ea5e9', order: 1 },
      { name: 'Em Execução', color: '#f59e0b', order: 2 },
      { name: 'Inspeção / Qualidade', color: '#8b5cf6', order: 3 },
      { name: 'Concluído', color: '#10b981', order: 4 },
    ],
  },
  {
    id: 'desenvolvimento',
    name: 'Desenvolvimento de Software',
    description:
      'Fluxo ágil / Kanban de engenharia com backlog, desenvolvimento, review e QA.',
    columns: [
      { name: 'Backlog', color: '#64748b', order: 0 },
      { name: 'A Fazer', color: '#0ea5e9', order: 1 },
      { name: 'Em Andamento', color: '#f59e0b', order: 2 },
      { name: 'Code Review', color: '#8b5cf6', order: 3 },
      { name: 'Testes / QA', color: '#ec4899', order: 4 },
      { name: 'Concluído', color: '#10b981', order: 5 },
    ],
  },
];
