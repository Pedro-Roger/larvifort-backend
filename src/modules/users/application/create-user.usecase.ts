import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { PasswordHasherPort } from '../../auth/application/ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from '../../auth/application/ports/password-hasher.port';
import type { User, UserRole } from '../domain/user';
import type { UserRepositoryPort } from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

export interface CreateUserInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: UserRole;
  teamId?: string | null;
  active?: boolean;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await this.hasher.hash(input.password);

    return this.users.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() ?? '',
      email,
      passwordHash,
      role: input.role ?? 'USER',
      teamId: input.teamId ?? null,
      active: input.active ?? true,
    });
  }
}
