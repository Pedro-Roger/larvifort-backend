import { LogoutUseCase } from './logout.usecase';
import type { RefreshTokenPort } from './ports/refresh-token.port';

describe('LogoutUseCase', () => {
  function makeSut() {
    const revokeByUserId = jest.fn().mockResolvedValue(undefined);
    const revokeByTokenHash = jest.fn().mockResolvedValue(undefined);
    const create = jest.fn();
    const findByTokenHash = jest.fn();
    const refreshTokens: RefreshTokenPort = {
      revokeByUserId,
      revokeByTokenHash,
      create,
      findByTokenHash,
    };
    const sut = new LogoutUseCase(refreshTokens);
    return { sut, revokeByUserId };
  }

  it('revoga refresh tokens do usuário autenticado e retorna mensagem de sucesso', async () => {
    const { sut, revokeByUserId } = makeSut();
    const result = await sut.execute('u-1');

    expect(revokeByUserId).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ message: 'Logout realizado com sucesso.' });
  });

  it('retorna mensagem de sucesso sem revogar se userId estiver vazio', async () => {
    const { sut, revokeByUserId } = makeSut();
    const result = await sut.execute('');

    expect(revokeByUserId).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logout realizado com sucesso.' });
  });
});
