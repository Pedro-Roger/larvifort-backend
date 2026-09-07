// TASK 02 — entidade pura de domínio para User.
// Espelha o modelo User do schema Prisma sem importar @prisma/client (regra do Repository).
// Nunca inclui passwordHash nesta entidade de saída.
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  active: boolean;
  teamId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
