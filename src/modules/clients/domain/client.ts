// TASK 04 — entidade pura de domínio para Cliente / Contato.
// Espelha o modelo Cliente do schema Prisma sem importar @prisma/client (regra do Repository).
export type StatusLead =
  'NOVO' | 'SEM_CONTATO' | 'EM_NEGOCIACAO' | 'CLIENTE_ATIVO';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthdate: Date | null;
  cpfCnpj: string | null;
  statusLead: StatusLead;
  origem: string | null;
  pais: string | null;
  cidade: string | null;
  uf: string | null;
  endereco: string | null;
  observacoes: string | null;
  empresaId: string | null;
  // Piscicultura
  laminaAgua: number | null;
  qtdViveiros: number | null;
  densidade: number | null;
  producaoMedia: number | null;
  temBercario: boolean;
  qtdBercarios: number | null;
  volumeBercarios: number | null;
  alimentadorAutomatico: boolean;
  createdAt: Date;
  updatedAt: Date;
}
