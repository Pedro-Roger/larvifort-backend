import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type {
  JwtAccessPayload,
  JwtTokenIssuerPort,
} from '../application/ports/token-issuer.port';

// TASK 01 slice 3c — emissor de JWT (HS256) para o access token.
// Usa `jsonwebtoken` direto em vez de `@nestjs/jwt` (JwtModule):
// o pacote é CommonJS puro (rodável no Jest CJS), sem depender do
// config ESM do JwtModule, e o secret vem por injeção do provider
// (default de dev, sobrescrevível por env).
// `sub` = id do usuário, payload carrega email/role (claims padrão RFC 7519).
// A assinatura/verificação real só acontece aqui (infra) — o usecase
// vê apenas a porta.
@Injectable()
export class JwtTokenIssuer implements JwtTokenIssuerPort {
  constructor(private readonly secret: string) {}

  sign(payload: JwtAccessPayload): Promise<string> {
    return Promise.resolve(
      jwt.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        this.secret,
        {
          algorithm: 'HS256',
          expiresIn: '15m',
          issuer: 'lavifort-api',
        },
      ),
    );
  }
}
