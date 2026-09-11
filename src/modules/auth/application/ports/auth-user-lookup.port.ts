import type { UserRole } from '../../domain/auth-user';

// TASK 01 — porta de lookup de usuário via AuthUserLookup.
// Interface mínima para injeção de dependência (não existe em runtime).

export const AUTH_USER_LOOKUP_PORT = 'AUTH_USER_LOOKUP_PORT';

export interface AuthUserLookupPort {
  findByEmail(email: string): Promise<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    active: boolean;
  } | null>;
  findById(id: string): Promise<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: UserRole;
    active: boolean;
  } | null>;
}
