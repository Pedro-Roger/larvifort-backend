import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import jwt from 'jsonwebtoken';

function mockHttpContext(req: {
  headers: Record<string, string>;
  user?: unknown;
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const secret = 'guard-test-secret';
  let originalSecret: string | undefined;
  let guard: JwtAuthGuard;

  beforeAll(() => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
    guard = new JwtAuthGuard();
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it('lança 401 sem header authorization', () => {
    const ctx = mockHttpContext({ headers: {} });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lança 401 com Bearer vazio', () => {
    const ctx = mockHttpContext({ headers: { authorization: 'Bearer   ' } });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lança 401 com token assinado com secret diferente', () => {
    const token = jwt.sign(
      { sub: 'u-1', email: 'test@lavifort.com.br', role: 'ADMIN' },
      'wrong-secret',
    );
    const ctx = mockHttpContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lança 401 com token expirado', () => {
    const token = jwt.sign(
      { sub: 'u-1', email: 'test@lavifort.com.br', role: 'ADMIN' },
      secret,
      { expiresIn: '-1s' },
    );
    const ctx = mockHttpContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lança 401 com token sem claims obrigatórias (ex: sem sub)', () => {
    const token = jwt.sign(
      { email: 'test@lavifort.com.br', role: 'ADMIN' },
      secret,
    );
    const ctx = mockHttpContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('retorna true e popula req.user com { id, email, role } para token válido', () => {
    const token = jwt.sign(
      { sub: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
      secret,
      { expiresIn: '15m' },
    );
    const req: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: `Bearer ${token}` },
    };
    const ctx = mockHttpContext(req);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
  });
});
