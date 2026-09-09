import { Inject, Injectable } from '@nestjs/common';
import type { RefreshTokenPort } from './ports/refresh-token.port';
import { REFRESH_TOKEN_PORT } from './ports/refresh-token.port';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_PORT)
    private readonly refreshTokenRepo: RefreshTokenPort,
  ) {}

  async execute(userId: string): Promise<void> {
    // Revoga todos os refresh tokens do usuário
    await this.refreshTokenRepo.revokeByUserId(userId);
  }
}
