import { UsersController } from './users.controller';
import type { ListUsersUseCase } from '../application/list-users.usecase';
import type { GetUserByIdUseCase } from '../application/get-user-by-id.usecase';
import type { CreateUserUseCase } from '../application/create-user.usecase';
import type { UpdateUserUseCase } from '../application/update-user.usecase';
import type { DeleteUserUseCase } from '../application/delete-user.usecase';
import type { UpdateMeUseCase } from '../application/update-me.usecase';
import type { User } from '../domain/user';

describe('UsersController', () => {
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

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();
    const updateMeExecute = jest.fn();

    const listUsers = { execute: listExecute } as unknown as ListUsersUseCase;
    const getUserById = {
      execute: getExecute,
    } as unknown as GetUserByIdUseCase;
    const createUser = {
      execute: createExecute,
    } as unknown as CreateUserUseCase;
    const updateUser = {
      execute: updateExecute,
    } as unknown as UpdateUserUseCase;
    const deleteUser = {
      execute: deleteExecute,
    } as unknown as DeleteUserUseCase;
    const updateMe = {
      execute: updateMeExecute,
    } as unknown as UpdateMeUseCase;

    const sut = new UsersController(
      listUsers,
      getUserById,
      createUser,
      updateUser,
      deleteUser,
      updateMe,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
      updateMeExecute,
    };
  }

  it('findMany delega para ListUsersUseCase', async () => {
    const { sut, listExecute } = makeSut();
    const paginatedResult = {
      data: [SAMPLE_USER],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    listExecute.mockResolvedValue(paginatedResult);

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      search: 'fernando',
    });

    expect(listExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'fernando',
    });
    expect(result).toEqual(paginatedResult);
  });

  it('getMe delega para GetUserByIdUseCase com userId do JWT', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_USER);

    const result = await sut.getMe('u-1');

    expect(getExecute).toHaveBeenCalledWith('u-1');
    expect(result).toEqual(SAMPLE_USER);
  });

  it('findById delega para GetUserByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_USER);

    const result = await sut.findById('u-1');

    expect(getExecute).toHaveBeenCalledWith('u-1');
    expect(result).toEqual(SAMPLE_USER);
  });

  it('create delega para CreateUserUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_USER);

    const dto = {
      firstName: 'Fernando',
      lastName: 'Silva',
      email: 'fernando@lavifort.com.br',
      password: 'Lavifort@123',
      role: 'ADMIN' as const,
    };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_USER);
  });

  it('updateMe delega para UpdateMeUseCase com userId do JWT', async () => {
    const { sut, updateMeExecute } = makeSut();
    updateMeExecute.mockResolvedValue({
      ...SAMPLE_USER,
      firstName: 'Maria',
    });

    const result = await sut.updateMe('u-1', { firstName: 'Maria' });

    expect(updateMeExecute).toHaveBeenCalledWith('u-1', {
      firstName: 'Maria',
    });
    expect(result.firstName).toBe('Maria');
  });

  it('update delega para UpdateUserUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_USER, firstName: 'Novo' });

    const result = await sut.update('u-1', { firstName: 'Novo' });

    expect(updateExecute).toHaveBeenCalledWith('u-1', { firstName: 'Novo' });
    expect(result.firstName).toBe('Novo');
  });

  it('delete delega para DeleteUserUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('u-1');

    expect(deleteExecute).toHaveBeenCalledWith('u-1');
  });
});
