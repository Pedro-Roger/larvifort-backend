import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { PasswordHasherPort } from '../../auth/application/ports/password-hasher.port';
import type { User } from '../domain/user';

describe('UpdateUserUseCase', () => {
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

  it('atualiza dados do usuário com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_USER);
    const findByEmail = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_USER,
      firstName: 'Novo',
      email: 'novo@lavifort.com.br',
    });
    const hash = jest.fn().mockResolvedValue('new-hash');

    const users = {
      findById,
      findByEmail,
      update,
    } as unknown as UserRepositoryPort;
    const hasher = { hash } as unknown as PasswordHasherPort;
    const sut = new UpdateUserUseCase(users, hasher);

    const result = await sut.execute('u-1', {
      firstName: 'Novo',
      email: 'novo@lavifort.com.br',
      password: 'NewPassword@123',
    });

    expect(findById).toHaveBeenCalledWith('u-1');
    expect(findByEmail).toHaveBeenCalledWith('novo@lavifort.com.br');
    expect(hash).toHaveBeenCalledWith('NewPassword@123');
    expect(update).toHaveBeenCalledWith('u-1', {
      firstName: 'Novo',
      email: 'novo@lavifort.com.br',
      passwordHash: 'new-hash',
    });
    expect(result.firstName).toBe('Novo');
  });

  it('lança 404 quando usuário não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const users = { findById } as unknown as UserRepositoryPort;
    const hasher = { hash: jest.fn() } as unknown as PasswordHasherPort;
    const sut = new UpdateUserUseCase(users, hasher);

    await expect(sut.execute('u-ghost', { firstName: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 409 quando o novo email já pertence a outro usuário', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_USER);
    const findByEmail = jest.fn().mockResolvedValue({
      ...SAMPLE_USER,
      id: 'u-2',
      email: 'outro@lavifort.com.br',
    });
    const update = jest.fn();

    const users = {
      findById,
      findByEmail,
      update,
    } as unknown as UserRepositoryPort;
    const hasher = { hash: jest.fn() } as unknown as PasswordHasherPort;
    const sut = new UpdateUserUseCase(users, hasher);

    await expect(
      sut.execute('u-1', { email: 'outro@lavifort.com.br' }),
    ).rejects.toThrow(ConflictException);

    expect(update).not.toHaveBeenCalled();
  });
});
