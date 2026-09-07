// TASK 01 slice 3f — entidade pura de domínio para RefreshToken.
// Espelha o modelo Prisma RefreshToken sem importar @prisma/client.
export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
