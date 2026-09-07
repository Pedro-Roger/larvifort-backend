import type { Client, StatusLead } from '../../domain/client';

export const CLIENT_REPOSITORY_PORT = 'CLIENT_REPOSITORY_PORT';

export interface FindClientsFilter {
  status?: StatusLead;
  empresaId?: string;
  cidade?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: Date | null;
  cpfCnpj?: string | null;
  statusLead?: StatusLead;
  origem?: string | null;
  pais?: string | null;
  cidade?: string | null;
  uf?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  empresaId?: string | null;
  laminaAgua?: number | null;
  qtdViveiros?: number | null;
  densidade?: number | null;
  producaoMedia?: number | null;
  temBercario?: boolean;
  qtdBercarios?: number | null;
  volumeBercarios?: number | null;
  alimentadorAutomatico?: boolean;
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: Date | null;
  cpfCnpj?: string | null;
  statusLead?: StatusLead;
  origem?: string | null;
  pais?: string | null;
  cidade?: string | null;
  uf?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  empresaId?: string | null;
  laminaAgua?: number | null;
  qtdViveiros?: number | null;
  densidade?: number | null;
  producaoMedia?: number | null;
  temBercario?: boolean;
  qtdBercarios?: number | null;
  volumeBercarios?: number | null;
  alimentadorAutomatico?: boolean;
}

export interface ClientRepositoryPort {
  findMany(
    filter: FindClientsFilter,
  ): Promise<{ data: Client[]; total: number }>;
  findById(id: string): Promise<Client | null>;
  findByCpfCnpj(cpfCnpj: string): Promise<Client | null>;
  create(data: CreateClientData): Promise<Client>;
  update(id: string, data: UpdateClientData): Promise<Client>;
  delete(id: string): Promise<void>;
}
