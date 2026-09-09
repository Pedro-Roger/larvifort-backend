import type { UserRole } from '../domain/auth-user';

import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.usecase';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import type { HashComparePort } from './ports/hash-compare.port';
import type { PasswordHasherPort } from './ports/password-hasher.port';
import type { JwtTokenIssuerPort } from './ports/token-issuer.port';
import type { RefreshTokenPort } from './ports/refresh-token.port';

function makeSut(
  user: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    active: boolean;
  } | null,
  compareResult = true,
) {
  const findByEmail = jest.fn().mockResolvedValue(user);
  const compare = jest.fn().mockResolvedValue(compareResult);
  const sign = jest.fn().mockResolvedValue('access-token');
  const hash = jest.fn().mockResolvedValue('hashed-refresh-token');
  const create = jest.fn().mockResolvedValue(undefined);

  const users: AuthUserLookupPort = { findByEmail, findById: jest.fn() };
  const hashes: HashComparePort = { compare };
  const tokenIssuer: JwtTokenIssuerPort = { sign };
  const passwordHasher: PasswordHasherPort = { hash };
  const refreshTokenRepo: RefreshTokenPort = {
    create: create,
    findByTokenHash: jest.fn(),
    revokeByUserId: jest.fn(),
    revokeByTokenHash: jest.fn(),
  };

  return {
    sut: new LoginUseCase(
      users,
      hashes,
      passwordHasher,
      tokenIssuer,
      refreshTokenRepo,
    ),
    findByEmail,
    compare,
    sign,
    createRefreshToken: create,
  };
}

const ACTIVE_USER = {
  id: 'u-1',
  email: 'fernando@lavifort.com.br',
  passwordHash: 'hash-bcrypt-cost-12',
  role: 'ADMIN' as UserRole,
  active: true,
};

describe('LoginUseCase', () => {
  it('retorna { accessToken, refreshToken, user } sem vazar passwordHash no login ok', async () => {
    const { sut, compare, sign, createRefreshToken } = makeSut(ACTIVE_USER);
    const result = await sut.execute({
      email: 'fernando@lavifort.com.br',
      password: 'Lavifort@123',
    });

    expect(result).toHaveProperty('accessToken', 'access-token');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(compare).toHaveBeenCalledWith('Lavifort@123', 'hash-bcrypt-cost-12');
    expect(sign).toHaveBeenCalledWith({
      sub: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(createRefreshToken).toHaveBeenCalled();
  });

  it('normaliza e-mail com trim + lowercase antes de buscar', async () => {
    const { sut, findByEmail } = makeSut(ACTIVE_USER);
    await sut.execute({
      email: '  Fernando@Lavifort.COM.BR  ',
      password: 'Lavifort@123',
    });
    expect(findByEmail).toHaveBeenCalledWith('fernando@lavifort.com.br');
  });

  it('lança 401 quando usuário não existe', async () => {
    const { sut, sign } = makeSut(null);
    await expect(
      sut.execute({ email: 'ghost@lavifort.com.br', password: 'x' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(sign).not.toHaveBeenCalled();
  });

  it('lança 401 quando senha está errada', async () => {
    const { sut, sign } = makeSut(ACTIVE_USER, false);
    await expect(
      sut.execute({ email: ACTIVE_USER.email, password: 'errada' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(sign).not.toHaveBeenCalled();
  });

  it('lança 401 quando usuário está inativo sem comparar hash nem emitir token', async () => {
    const { sut, compare, sign } = makeSut({ ...ACTIVE_USER, active: false });
    await expect(
      sut.execute({ email: ACTIVE_USER.email, password: 'Lavifort@123' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });

  it('lança 401 com e-mail/senha vazios', async () => {
    const { sut } = makeSut(ACTIVE_USER);
    await expect(sut.execute({ email: '', password: '' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
