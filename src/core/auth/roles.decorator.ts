import { SetMetadata } from '@nestjs/common';

// Espelha o enum `Role` do schema Prisma (ADMIN|USER).
// Tipo local (string union) de propósito: `core/auth` não importa
// `@prisma/client` (regra do Repository — só `infra/` e `core/database/*`).
export type AppRole = 'ADMIN' | 'USER';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
