import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { extractCurrentUser } from './current-user.decorator';

function emptyContext(): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('libera rota sem @Roles(...)', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(new RolesGuard(reflector).canActivate(emptyContext())).toBe(true);
  });

  it('libera ADMIN em rota @Roles(ADMIN)', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'ADMIN' } }) }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lança 403 para USER em rota @Roles(ADMIN)', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'USER' } }) }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('lança 403 sem request.user em rota protegida', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it(`expõe metadata na chave ${ROLES_KEY}`, () => {
    const reflector = new Reflector();
    const getAll = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['USER']);
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'USER' } }) }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
    expect(getAll).toHaveBeenCalledWith(ROLES_KEY, expect.anything());
  });
});

describe('extractCurrentUser', () => {
  it('retorna o user completo sem data', () => {
    const user = { id: 'u1', role: 'ADMIN' };
    expect(extractCurrentUser({ user })).toEqual(user);
  });

  it('retorna o campo pedido via data', () => {
    expect(extractCurrentUser({ user: { id: 'u1' } }, 'id')).toBe('u1');
  });

  it('retorna undefined sem user', () => {
    expect(extractCurrentUser({})).toBeUndefined();
  });
});
