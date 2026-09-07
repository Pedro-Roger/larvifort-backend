import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepositoryPort } from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.users.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    await this.users.delete(id);
  }
}
