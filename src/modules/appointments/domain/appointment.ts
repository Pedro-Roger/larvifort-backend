// TASK 05 — entidade pura de domínio para Compromissos (Agenda).
// Espela o modelo Appointment do schema Prisma sem importar @prisma/client.

export type TipoCompromisso = 'REUNIAO' | 'VISITA';

export interface Appointment {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  data: Date;
  horario: string | null;
  endereco: string | null;
  observacoes: string | null;
  clienteId: string | null;
  empresaId: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
