// TASK 02 — entidade pura de domínio para Team (Equipe).
// Espelha o modelo Team do schema Prisma sem importar @prisma/client.

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}