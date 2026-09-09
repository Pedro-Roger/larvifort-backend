// TASK 01 — porta de persistência/revogação de RefreshToken.
// O usecase só conhece este contrato para emitir ou revogar tokens.
// Token de DI: interfaces não existem em runtime.

export const REFRESH_TOKEN_PORT = 'REFRESH_TOKEN_PORT';

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenPort {
  create(input: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeByUserId(userId: string): Promise<void>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
}
