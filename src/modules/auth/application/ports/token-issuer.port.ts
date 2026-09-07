// TASK 01 — porta de emissor de token JWT.
// Interface para geração de tokens de acesso (sign com HS256).

export const JWT_TOKEN_ISSUER_PORT = 'JWT_TOKEN_ISSUER_PORT';

export interface JwtTokenIssuerPort {
  sign(payload: { sub: string; email?: string; role?: string }): Promise<string>;
}