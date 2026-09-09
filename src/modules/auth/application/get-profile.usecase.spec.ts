import { UnauthorizedException } from '@nestjs/common';
import { GetProfileUseCase } from './get-profile.usecase';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';

function makeSut() {
  const findByEmail = jest.fn().mockResolvedValue(null);
  const findById = jest.fn().mockResolvedValue({
    id: 'u-1',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN',
    active: true,
  });
  const users: AuthUserLookupPort = { findByEmail, findById };
  return { sut: new GetProfileUseCase(users), findById };
}

describe('GetProfileUseCase', () => {
  it('retorna os dados reais do usuário pelo id', async () => {
    const { sut, findById } = makeSut();
    const result = await sut.execute('u-1');

    expect(result).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(findById).toHaveBeenCalledWith('u-1');
  });

  it('lança 401 quando o usuário não existe', async () => {
    const { sut, findById } = makeSut();
    findById.mockResolvedValue(null);
    await expect(sut.execute('u-ghost')).rejects.toThrow(UnauthorizedException);
  });

  it('lança 401 quando o usuário está inativo', async () => {
    const { sut, findById } = makeSut();
    findById.mockResolvedValue({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
      active: false,
    });
    await expect(sut.execute('u-1')).rejects.toThrow(UnauthorizedException);
  });

  it('lança 401 quando userId é vazio', async () => {
    const { sut } = makeSut();
    await expect(sut.execute('')).rejects.toThrow(UnauthorizedException);
  });
});
