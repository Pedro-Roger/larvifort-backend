import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '../domain/user';
import type { UserRepositoryPort } from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }
}
