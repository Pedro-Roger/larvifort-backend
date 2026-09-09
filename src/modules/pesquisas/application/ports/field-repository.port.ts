import type { FieldSearch, Uniformidade } from '../../domain/field-search';

export const FIELD_SEARCH_REPOSITORY_PORT = 'FIELD_SEARCH_REPOSITORY_PORT';

export interface FindPesquisasFilter {
  clienteId?: string;
  cliente?: string;
  somenteLarvifort?: boolean;
  de?: Date;
  ate?: Date;
  page: number;
  limit: number;
}

export interface CreateFieldSearchData {
  clienteId: string;
  dataPesquisa?: Date;
  responsavelId?: string | null;
  larvas: string[];
  maioriaLarvifort?: boolean;
  parouLarvifort?: boolean;
  motivosSaida?: string[];
  outroMotivo?: string | null;
  uniformidadeBercario?: Uniformidade | null;
  uniformidadeCultivo?: Uniformidade | null;
  sobrevBercario?: number | null;
  sobrevCultivo?: number | null;
  resultadosUltimoCiclo?: string | null;
  observacoes?: string | null;
}

export interface UpdateFieldSearchData {
  clienteId?: string | null;
  dataPesquisa?: Date | null;
  responsavelId?: string | null;
  larvas?: string[];
  maioriaLarvifort?: boolean;
  parouLarvifort?: boolean;
  motivosSaida?: string[];
  outroMotivo?: string | null;
  uniformidadeBercario?: Uniformidade | null;
  uniformidadeCultivo?: Uniformidade | null;
  sobrevBercario?: number | null;
  sobrevCultivo?: number | null;
  resultadosUltimoCiclo?: string | null;
  observacoes?: string | null;
}

export interface FieldSearchRepositoryPort {
  findMany(
    filter: FindPesquisasFilter,
  ): Promise<{ data: FieldSearch[]; total: number }>;
  findById(id: string): Promise<FieldSearch | null>;
  create(data: CreateFieldSearchData): Promise<FieldSearch>;
  update(id: string, data: UpdateFieldSearchData): Promise<FieldSearch>;
  delete(id: string): Promise<void>;
}
