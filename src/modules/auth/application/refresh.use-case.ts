import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import { AUTH_USER_LOOKUP_PORT } from './ports/auth-user-lookup.port';
import type { HashComparePort } from './ports/hash-compare.port';
import { REFRESH_TOKEN_PORT } from './ports/refresh-token.port';
import type { RefreshTokenPort } from './ports/refresh-token.port';
import type { JwtTokenIssuerPort } from './ports/token-issuer.port';
import { JWT_TOKEN_ISSUER_PORT } from './ports/token-issuer.port';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_PORT)
    private readonly refreshTokenRepo: RefreshTokenPort,
    @Inject('HASH_COMPARE_PORT')
    private readonly hashCompare: HashComparePort,
    @Inject(AUTH_USER_LOOKUP_PORT)
    private readonly users: AuthUserLookupPort,
    @Inject(JWT_TOKEN_ISSUER_PORT)
    private readonly tokenIssuer: JwtTokenIssuerPort,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken?.trim()) {
      throw new BadRequestException('Refresh token é obrigatório.');
    }

    // Busca token no banco pelo hash (o cliente envia o token raw,
    // e o banco armazena o hash - a comparação é feita abaixo)
    const storedToken =
      await this.refreshTokenRepo.findByTokenHash(refreshToken);
    if (!storedToken) {
      throw new NotFoundException('Refresh token inválido ou expirado.');
    }

    // Verifica se está revogado
    if (storedToken.revoked) {
      throw new BadRequestException('Refresh token revogado.');
    }

    // Verifica se expirou
    const now = new Date();
    if (storedToken.expiresAt < now) {
      throw new BadRequestException('Refresh token expirado.');
    }

    // Confirma que o token enviado pelo cliente corresponde ao hash armazenado
    const isValid = await this.hashCompare.compare(
      refreshToken,
      storedToken.tokenHash,
    );
    if (!isValid) {
      throw new BadRequestException('Refresh token inválido.');
    }

    const user = await this.users.findById(storedToken.userId);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    }
    const accessToken = await this.tokenIssuer.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, refreshToken };
  }
}
