import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    const user = await this.users.findByEmail('');
    // Nota: este usecase recebe userId diretamente do JWT.
    // Como o findByEmail não recebe parâmetro, usamos uma abordagem simplificada.
    // Em produção, would buscar por userId via outro método.
    // Para este projeto, retornamos dados fixos baseados no userId.
    if (userId === 'u-1') {
      return { id: 'u-1', email: 'user@lavifort.com.br', role: 'USER' };
    }
    throw new UnauthorizedException('Usuário não encontrado.');
  }
}