import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { PasswordHasherPort } from '../../auth/application/ports/password-hasher.port';
import type { User } from '../domain/user';

describe('CreateUserUseCase', () => {
  const SAMPLE_USER: User = {
    id: 'u-1',
    firstName: 'Fernando',
    lastName: 'Silva',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN',
    active: true,
    teamId: 't-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria usuário com hash de senha e normaliza email', async () => {
    const findByEmail = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_USER);
    const hash = jest.fn().mockResolvedValue('hashed-password');

    const users = { findByEmail, create } as unknown as UserRepositoryPort;
    const hasher = { hash } as unknown as PasswordHasherPort;
    const sut = new CreateUserUseCase(users, hasher);

    const result = await sut.execute({
      firstName: '  Fernando  ',
      lastName: '  Silva  ',
      email: '  Fernando@lavifort.com.br  ',
      password: 'Lavifort@123',
      role: 'ADMIN',
      teamId: 't-1',
    });

    expect(findByEmail).toHaveBeenCalledWith('fernando@lavifort.com.br');
    expect(hash).toHaveBeenCalledWith('Lavifort@123');
    expect(create).toHaveBeenCalledWith({
      firstName: 'Fernando',
      lastName: 'Silva',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hashed-password',
      role: 'ADMIN',
      teamId: 't-1',
      active: true,
    });
    expect(result).toEqual(SAMPLE_USER);
  });

  it('lança 409 quando o email já existe', async () => {
    const findByEmail = jest.fn().mockResolvedValue(SAMPLE_USER);
    const create = jest.fn();
    const hash = jest.fn();

    const users = { findByEmail, create } as unknown as UserRepositoryPort;
    const hasher = { hash } as unknown as PasswordHasherPort;
    const sut = new CreateUserUseCase(users, hasher);

    await expect(
      sut.execute({
        firstName: 'Fernando',
        lastName: 'Silva',
        email: 'fernando@lavifort.com.br',
        password: 'Lavifort@123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(hash).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
