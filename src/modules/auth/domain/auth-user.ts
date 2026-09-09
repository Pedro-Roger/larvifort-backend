// TASK 01 — entidade pura de domínio para Usuário autenticado.
// Espelha o modelo User do schema Prisma sem importar @prisma/client (regra do Repository).
// Nunca inclui passwordHash nesta entidade de saída.

export type UserRole = 'ADMIN' | 'USER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
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
