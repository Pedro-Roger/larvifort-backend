import { Inject } from '@nestjs/common';
import type { RefreshToken } from '../../modules/auth/domain/refresh-token';
import type { RefreshTokenPort } from '../../modules/auth/application/ports/refresh-token.port';
import { REFRESH_TOKEN_PORT } from '../../modules/auth/application/ports/refresh-token.port';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenPort {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshToken> {
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        revoked: false,
      },
    });
    return { id: token.id, userId: token.userId, tokenHash: token.tokenHash, expiresAt: token.expiresAt, revoked: token.revoked, createdAt: token.createdAt };
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!token) return null;
    return { id: token.id, userId: token.userId, tokenHash: token.tokenHash, expiresAt: token.expiresAt, revoked: token.revoked, createdAt: token.createdAt };
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
}