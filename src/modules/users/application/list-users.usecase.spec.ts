import { ListUsersUseCase } from './list-users.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { User } from '../domain/user';

describe('ListUsersUseCase', () => {
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

  it('retorna lista paginada de usuários', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_USER], total: 1 });
    const users = { findMany } as unknown as UserRepositoryPort;
    const sut = new ListUsersUseCase(users);

    const result = await sut.execute({
      page: 1,
      limit: 10,
      search: 'fernando',
    });

    expect(findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'fernando',
    });
    expect(result).toEqual({
      data: [SAMPLE_USER],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });
});
