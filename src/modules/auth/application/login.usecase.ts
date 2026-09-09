import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from '../domain/auth-user';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import { AUTH_USER_LOOKUP_PORT } from './ports/auth-user-lookup.port';
import type { HashComparePort } from './ports/hash-compare.port';
import { HASH_COMPARE_PORT } from './ports/hash-compare.port';
import type { JwtTokenIssuerPort } from './ports/token-issuer.port';
import { JWT_TOKEN_ISSUER_PORT } from './ports/token-issuer.port';
import type { PasswordHasherPort } from './ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from './ports/password-hasher.port';
import type { RefreshTokenPort } from './ports/refresh-token.port';
import { REFRESH_TOKEN_PORT } from './ports/refresh-token.port';
import { v4 as uuidv4 } from 'uuid';
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_USER_LOOKUP_PORT)
    private readonly users: AuthUserLookupPort,
    @Inject(HASH_COMPARE_PORT)
    private readonly hashes: HashComparePort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(JWT_TOKEN_ISSUER_PORT)
    private readonly tokenIssuer: JwtTokenIssuerPort,
    @Inject(REFRESH_TOKEN_PORT)
    private readonly refreshTokenRepo: RefreshTokenPort,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';
    if (!email || !password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const user = await this.users.findByEmail(email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const ok = await this.hashes.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // Gera access token
    const accessToken = await this.tokenIssuer.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Gera refresh token: UUID aleatório + hash
    const refreshTokenRaw = uuidv4();
    const refreshTokenHash = await this.passwordHasher.hash(refreshTokenRaw);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw, // retorna o token raw para o cliente armazenar
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
