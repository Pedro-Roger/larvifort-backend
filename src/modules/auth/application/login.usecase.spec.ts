import { UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '../domain/auth-user';
import { LoginUseCase } from './login.usecase';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import type { HashComparePort } from './ports/hash-compare.port';
import type { JwtTokenIssuerPort } from './ports/token-issuer.port';

function makeSut(user: AuthUser | null, compareResult = true) {
  const findByEmail = jest.fn().mockResolvedValue(user);
  const findById = jest.fn().mockResolvedValue(user);
  const compare = jest.fn().mockResolvedValue(compareResult);
  const sign = jest.fn().mockResolvedValue('access-token');
  const users: AuthUserLookupPort = { findByEmail, findById };
  const hashes: HashComparePort = { compare };
  const tokenIssuer: JwtTokenIssuerPort = { sign };
  return {
    sut: new LoginUseCase(users, hashes, tokenIssuer),
    findByEmail,
    compare,
    sign,
  };
}

const ACTIVE_USER: AuthUser = {
  id: 'u-1',
  email: 'fernando@lavifort.com.br',
  passwordHash: 'hash-bcrypt-cost-12',
  role: 'ADMIN',
  active: true,
};

describe('LoginUseCase', () => {
  it('retorna { accessToken, user } sem vazar passwordHash no login ok', async () => {
    const { sut, compare, sign } = makeSut(ACTIVE_USER);
    const result = await sut.execute({
      email: 'fernando@lavifort.com.br',
      password: 'Lavifort@123',
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      user: {
        id: 'u-1',
        email: 'fernando@lavifort.com.br',
        role: 'ADMIN',
      },
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(compare).toHaveBeenCalledWith('Lavifort@123', 'hash-bcrypt-cost-12');
    expect(sign).toHaveBeenCalledWith({
      sub: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
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
