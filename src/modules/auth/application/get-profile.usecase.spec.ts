import { UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '../domain/auth-user';
import { GetProfileUseCase } from './get-profile.usecase';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';

function makeSut(user: AuthUser | null) {
  const findById = jest.fn().mockResolvedValue(user);
  const findByEmail = jest.fn();
  const users: AuthUserLookupPort = { findById, findByEmail };
  return { sut: new GetProfileUseCase(users), findById };
}

const ACTIVE_USER: AuthUser = {
  id: 'u-1',
  email: 'fernando@lavifort.com.br',
  passwordHash: 'hash-bcrypt-cost-12',
  role: 'ADMIN',
  active: true,
};

describe('GetProfileUseCase', () => {
  it('retorna id/email/role sem vazar passwordHash quando o usuário existe e está ativo', async () => {
    const { sut, findById } = makeSut(ACTIVE_USER);
    const result = await sut.execute('u-1');

    expect(findById).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('lança 401 quando o usuário não existe no banco', async () => {
    const { sut } = makeSut(null);
    await expect(sut.execute('u-ghost')).rejects.toThrow(UnauthorizedException);
  });

  it('lança 401 quando o usuário está inativo', async () => {
    const { sut } = makeSut({ ...ACTIVE_USER, active: false });
    await expect(sut.execute('u-1')).rejects.toThrow(UnauthorizedException);
  });

  it('lança 401 quando userId é vazio', async () => {
    const { sut } = makeSut(ACTIVE_USER);
    await expect(sut.execute('')).rejects.toThrow(UnauthorizedException);
  });
});
