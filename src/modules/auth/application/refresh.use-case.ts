import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type { RefreshToken } from '../domain/refresh-token';
import type { HashComparePort } from '../application/ports/hash-compare.port';
import { REFRESH_TOKEN_PORT } from '../application/ports/refresh-token.port';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_PORT)
    private readonly refreshTokenRepo: RefreshTokenPort,
    @Inject('HASH_COMPARE_PORT')
    private readonly hashCompare: HashComparePort,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ userId: string; newRefreshToken: string }> {
    if (!refreshToken?.trim()) {
      throw new BadRequestException('Refresh token é obrigatório.');
    }

    // Busca token no banco pelo hash (o cliente envia o token raw,
    // e o banco armazena o hash - a comparação é feita abaixo)
    const storedToken = await this.refreshTokenRepo.findByTokenHash(refreshToken);
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
    const isValid = await this.hashCompare.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Refresh token inválido.');
    }

    // Revoga o token antigo
    await this.refreshTokenRepo.revokeByTokenHash(refreshToken);

    // Gera novo refresh token (uuid aleatório)
    const newRefreshToken = uuidv4();

    return { userId: storedToken.userId, newRefreshToken };
  }
}