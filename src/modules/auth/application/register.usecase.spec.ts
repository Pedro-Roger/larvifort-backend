import { BadRequestException, ConflictException } from '@nestjs/common';
import type { UserRole } from '../domain/auth-user';
import { RegisterUseCase } from './register.usecase';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import type { AuthUserWriterPort } from './ports/auth-user-writer.port';
import type { PasswordHasherPort } from './ports/password-hasher.port';

function makeSut(options?: {
  existingUser?: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    active: boolean;
  } | null;
  createdUser?: any;
}) {
  const findByEmail = jest
    .fn()
    .mockResolvedValue(options?.existingUser ?? null);
  const hash = jest.fn().mockResolvedValue('hash-bcrypt-cost-12');
  const create = jest.fn().mockResolvedValue(
    options?.createdUser ?? {
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      firstName: 'Maria',
      lastName: 'Lima',
      role: 'USER',
      active: true,
      teamId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );
  const users: AuthUserLookupPort = { findByEmail, findById: jest.fn() };
  const writers: AuthUserWriterPort = { create };
  const hasher: PasswordHasherPort = { hash };
  return {
    sut: new RegisterUseCase(users, writers, hasher),
    findByEmail,
    hash,
    create,
  };
}

const INPUT = {
  firstName: 'Maria',
  lastName: 'Lima',
  email: '  Maria@Lavifort.COM.BR  ',
  password: 'Lavifort@123',
};

describe('RegisterUseCase', () => {
  it('normaliza e-mail, hasheia senha, cria com role USER/active e retorna conta sem passwordHash', async () => {
    const { sut, findByEmail, hash, create } = makeSut();
    const result = await sut.execute(INPUT);

    expect(findByEmail).toHaveBeenCalledWith('maria@lavifort.com.br');
    expect(hash).toHaveBeenCalledWith('Lavifort@123');
    expect(create).toHaveBeenCalledWith({
      firstName: 'Maria',
      lastName: 'Lima',
      email: 'maria@lavifort.com.br',
      passwordHash: 'hash-bcrypt-cost-12',
      role: 'USER',
      active: true,
    });
    expect(result).toEqual({
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      firstName: 'Maria',
      lastName: 'Lima',
      role: 'USER',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('lança 409 quando o e-mail já está cadastrado (sem hashear nem criar)', async () => {
    const { sut, hash, create } = makeSut({
      existingUser: {
        id: 'u-1',
        email: 'maria@lavifort.com.br',
        passwordHash: 'hash-antigo',
        role: 'USER',
        active: true,
      },
    });
    await expect(sut.execute(INPUT)).rejects.toThrow(ConflictException);
    expect(hash).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('lança 400 defensivo com dados incompletos', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        firstName: '',
        lastName: 'Lima',
        email: 'x@y.co',
        password: '12345678',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
