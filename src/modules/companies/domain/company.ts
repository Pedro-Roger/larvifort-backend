// TASK 03 — entidades puras de domínio para Empresa e Grupo Comercial.
// Espelha os modelos Empresa e GrupoComercial do schema Prisma sem importar @prisma/client.
export type StatusEmpresa = 'ATIVA' | 'PROSPECT' | 'INATIVA';

export interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  status: StatusEmpresa;
  grupoId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommercialGroup {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
