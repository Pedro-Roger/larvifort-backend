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

  it('revoga refresh tokens do usuário autenticado', async () => {
    const { sut, revokeByUserId } = makeSut();
    const result = await sut.execute('u-1');

    expect(revokeByUserId).toHaveBeenCalledWith('u-1');
    expect(result).toBeUndefined();
  });
});
