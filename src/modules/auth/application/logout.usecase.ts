import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../domain/auth-user';
import type { RefreshTokenPort } from './ports/refresh-token.port';
import { REFRESH_TOKEN_PORT } from './application/ports/refresh-token.port';

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