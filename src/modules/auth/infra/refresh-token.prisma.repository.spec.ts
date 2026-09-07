import { PrismaRefreshTokenRepository } from './refresh-token.prisma.repository';

describe('PrismaRefreshTokenRepository', () => {
  function makeSut(mocks: {
    create?: jest.Mock;
    findUnique?: jest.Mock;
    updateMany?: jest.Mock;
  }) {
    const prisma = {
      refreshToken: {
        create: mocks.create ?? jest.fn(),
        findUnique: mocks.findUnique ?? jest.fn(),
        updateMany: mocks.updateMany ?? jest.fn(),
      },
    };
    const sut = new PrismaRefreshTokenRepository(prisma);
    return { sut, prisma: prisma.refreshToken };
  }

  const SAMPLE_ROW = {
    id: 'rt-1',
    userId: 'u-1',
    tokenHash: 'sha256-hash',
    expiresAt: new Date('2026-10-01'),
    revoked: false,
    createdAt: new Date('2026-09-01'),
  };

  it('cria refresh token e retorna o registro', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_ROW);
    const { sut } = makeSut({ create });

    const result = await sut.create({
      userId: 'u-1',
      tokenHash: 'sha256-hash',
      expiresAt: new Date('2026-10-01'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        tokenHash: 'sha256-hash',
        expiresAt: new Date('2026-10-01'),
        revoked: false,
      },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revoked: true,
        createdAt: true,
      },
    });
    expect(result).toEqual(SAMPLE_ROW);
  });

  it('busca por tokenHash retornando o registro ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_ROW)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByTokenHash('sha256-hash');
    expect(found).toEqual(SAMPLE_ROW);

    const missing = await sut.findByTokenHash('not-found');
    expect(missing).toBeNull();
  });

  it('revoga todos os tokens ativos do usuário por userId', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const { sut } = makeSut({ updateMany });

    await sut.revokeByUserId('u-1');

    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'u-1', revoked: false },
      data: { revoked: true },
    });
  });

  it('revoga token por tokenHash', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const { sut } = makeSut({ updateMany });

    await sut.revokeByTokenHash('sha256-hash');

    expect(updateMany).toHaveBeenCalledWith({
      where: { tokenHash: 'sha256-hash', revoked: false },
      data: { revoked: true },
    });
  });
});
