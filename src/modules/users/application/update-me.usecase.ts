import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { User } from '../domain/user';
import type {
  UserRepositoryPort,
  UpdateUserData,
} from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ): Promise<User> {
    if (!userId) {
      throw new BadRequestException('Usuário inválido.');
    }

    const updateData: UpdateUserData = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;

    return this.users.update(userId, updateData);
  }
}
