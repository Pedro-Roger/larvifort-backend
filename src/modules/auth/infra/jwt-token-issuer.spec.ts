import { JwtTokenIssuer } from './jwt-token-issuer';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// Spec do emissor JWT (slice 3c): comportamento real de assinatura.
// Round-trip `sign` → `verify` com o mesmo secret comprova que o token
// é um JWT HS256 válido e carrega exactamente os claims do login.
// Opção `ignoreExpiration: true` só para não depender de relógio no
// teste de estrutura (o TTL em si é configurado com `expiresIn: '15m'`).
describe('JwtTokenIssuer', () => {
  const secret = 'test-secret';

  function makeSut() {
    const sut = new JwtTokenIssuer(secret);
    return { sut };
  }

  it('retorna um JWT verificável com os payload claims (sub/email/role)', async () => {
    const { sut } = makeSut();
    const token = await sut.sign({
      sub: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });

    const decoded = jwt.verify(token, secret, {
      ignoreExpiration: true,
    }) as JwtPayload & { email: string; role: string };

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(decoded.sub).toBe('u-1');
    expect(decoded.email).toBe('fernando@lavifort.com.br');
    expect(decoded.role).toBe('ADMIN');
    // `roll` nunca deve vazar no token: só email/role/sub são claims.
    expect(decoded).not.toHaveProperty('passwordHash');
  });

  it('rejeita token assinado com outro secret', async () => {
    const { sut } = makeSut();
    const token = await sut.sign({
      sub: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });

    expect(() => jwt.verify(token, 'outro-secret')).toThrow();
  });

  it('emite access token com validade de 7 dias', async () => {
    const { sut } = makeSut();
    const token = await sut.sign({ sub: 'u-1' });
    const decoded = jwt.decode(token) as JwtPayload;

    expect(decoded.exp! - decoded.iat!).toBe(7 * 24 * 60 * 60);
  });
});
