// TASK 07 — entidade pura de domínio para FieldSearch / Pesquisa de Campo.
// Espelha o modelo FieldSearch do schema Prisma sem importar @prisma/client (regra do Repository).

export type Uniformidade = 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';

export interface FieldSearchCliente {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  cidade?: string | null;
}

export interface FieldSearchResponsavel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface FieldSearch {
  id: string;
  clienteId: string;
  cliente?: FieldSearchCliente | null;
  dataPesquisa: Date;
  responsavelId?: string | null;
  responsavel?: FieldSearchResponsavel | null;
  larvas: string[];
  maioriaLarvifort: boolean;
  parouLarvifort: boolean;
  motivosSaida: string[];
  outroMotivo?: string | null;
  uniformidadeBercario?: Uniformidade | null;
  uniformidadeCultivo?: Uniformidade | null;
  sobrevBercario?: number | null; // 0-100
  sobrevCultivo?: number | null; // 0-100
  resultadosUltimoCiclo?: string | null;
  observacoes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
