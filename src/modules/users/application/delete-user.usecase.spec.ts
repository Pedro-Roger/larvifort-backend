import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { User } from '../domain/user';

describe('DeleteUserUseCase', () => {
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

  it('deleta usuário quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_USER);
    const del = jest.fn().mockResolvedValue(undefined);
    const users = { findById, delete: del } as unknown as UserRepositoryPort;
    const sut = new DeleteUserUseCase(users);

    await sut.execute('u-1');

    expect(findById).toHaveBeenCalledWith('u-1');
    expect(del).toHaveBeenCalledWith('u-1');
  });

  it('lança 404 quando usuário não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const users = { findById, delete: del } as unknown as UserRepositoryPort;
    const sut = new DeleteUserUseCase(users);

    await expect(sut.execute('u-ghost')).rejects.toThrow(NotFoundException);
    expect(del).not.toHaveBeenCalled();
  });
});
