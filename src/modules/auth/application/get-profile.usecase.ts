import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from '../domain/auth-user';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import { AUTH_USER_LOOKUP_PORT } from './ports/auth-user-lookup.port';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(AUTH_USER_LOOKUP_PORT)
    private readonly users: AuthUserLookupPort,
  ) {}

  async execute(userId: string): Promise<AuthenticatedUser> {
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const user = await this.users.findById(userId);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
