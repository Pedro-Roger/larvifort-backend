import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get-user-by-id.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { User } from '../domain/user';

describe('GetUserByIdUseCase', () => {
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

  it('retorna usuário quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_USER);
    const users = { findById } as unknown as UserRepositoryPort;
    const sut = new GetUserByIdUseCase(users);

    const result = await sut.execute('u-1');

    expect(findById).toHaveBeenCalledWith('u-1');
    expect(result).toEqual(SAMPLE_USER);
  });

  it('lança 404 quando usuário não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const users = { findById } as unknown as UserRepositoryPort;
    const sut = new GetUserByIdUseCase(users);

    await expect(sut.execute('u-ghost')).rejects.toThrow(NotFoundException);
  });
});
