import { PrismaAuthUserLookupRepository } from './auth-user-lookup.prisma.repository';

// TASK 01 slice 3b+3e — unit do adapter Prisma com leitor mockado
// (sem DB real). Valida mapeamento User→AuthUser e o `null` de ausente.
function makeSut(findUnique: jest.Mock): {
  sut: PrismaAuthUserLookupRepository;
  findUnique: jest.Mock;
} {
  const prisma = { user: { findUnique } };
  return { sut: new PrismaAuthUserLookupRepository(prisma), findUnique };
}

describe('PrismaAuthUserLookupRepository', () => {
  it('mapeia a linha do Prisma para AuthUser por e-mail', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'ADMIN',
      active: true,
    });
    const { sut } = makeSut(findUnique);

    await expect(sut.findByEmail('fernando@lavifort.com.br')).resolves.toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'ADMIN',
      active: true,
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'fernando@lavifort.com.br' },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });
  });

  it('retorna null quando o e-mail não existe', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut(findUnique);

    await expect(sut.findByEmail('ghost@lavifort.com.br')).resolves.toBeNull();
  });

  it('mapeia a linha do Prisma para AuthUser por id', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'ADMIN',
      active: true,
    });
    const { sut } = makeSut(findUnique);

    await expect(sut.findById('u-1')).resolves.toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'ADMIN',
      active: true,
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });
  });

  it('retorna null quando o id não existe', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut(findUnique);

    await expect(sut.findById('u-ghost')).resolves.toBeNull();
  });
});
