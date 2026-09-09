// TASK 01 — porta de writer de usuário via AuthUserWriter.
// Interface mínima para injeção de dependência (não existe em runtime).

export const AUTH_USER_WRITER_PORT = 'AUTH_USER_WRITER_PORT';

import type { UserRole } from '../../domain/auth-user';

export interface NewAuthUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
}

export interface AuthUserWriterPort {
  create(
    data: NewAuthUser,
  ): Promise<{ id: string; email: string; role: UserRole }>;
}
