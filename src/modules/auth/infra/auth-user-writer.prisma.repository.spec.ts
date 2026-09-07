import { PrismaAuthUserWriterRepository } from './auth-user-writer.prisma.repository';

// TASK 01 slice 3d — unit do adapter Prisma de escrita com mock
// (sem DB real). Valida que o `create` recebe `data` com os campos do
// registro e devolve a linha persistida mapeada como AuthUser.
function makeSut(create: jest.Mock): {
  sut: PrismaAuthUserWriterRepository;
  create: jest.Mock;
} {
  const prisma = { user: { create } };
  return { sut: new PrismaAuthUserWriterRepository(prisma), create };
}

describe('PrismaAuthUserWriterRepository', () => {
  it('cria o usuário com os dados do registro e mapeia para AuthUser', async () => {
    const create = jest.fn().mockResolvedValue({
      id: 'u-new',
      firstName: 'Maria',
      lastName: 'Lima',
      email: 'maria@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'USER',
      active: true,
    });
    const { sut } = makeSut(create);

    await expect(
      sut.create({
        firstName: 'Maria',
        lastName: 'Lima',
        email: 'maria@lavifort.com.br',
        passwordHash: 'hash-bcrypt-cost-12',
        role: 'USER',
        active: true,
      }),
    ).resolves.toEqual({
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'USER',
      active: true,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        firstName: 'Maria',
        lastName: 'Lima',
        email: 'maria@lavifort.com.br',
        passwordHash: 'hash-bcrypt-cost-12',
        role: 'USER',
        active: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });
  });
});
