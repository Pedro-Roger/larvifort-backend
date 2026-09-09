export const DASHBOARD_REPOSITORY_PORT = 'DASHBOARD_REPOSITORY_PORT';

export interface DashboardRepositoryPort {
  resumo(): Promise<{
    totalClientes: number;
    clientesAtivos: number;
    taxaConversao: number;
    receitaTotal: number;
    ticketMedio: number;
    vendasMes: number;
    metaValor: number;
    metaVolume: number;
  }>;
  frequenciaVisitas(): Promise<
    {
      cliente: string;
      visitas: number;
    }[]
  >;
  atividadeClientes(): Promise<
    {
      cliente: string;
      ultimaVisita: string;
      proximaVisita: string;
      status: string;
    }[]
  >;
  taxaVendas(): Promise<{
    taxaConversao: number;
    ticketMedio: number;
  }>;
  metas(): Promise<{
    valorAtual: number;
    valorMeta: number;
    metaVolume: number;
  }>;
  workload(): Promise<
    {
      userId: string;
      userName: string;
      tarefasAbertas: number;
      tarefasEmAndamento: number;
    }[]
  >;
}
