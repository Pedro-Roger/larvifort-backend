import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PasswordHasherPort } from '../../auth/application/ports/password-hasher.port';
import { PASSWORD_HASHER_PORT } from '../../auth/application/ports/password-hasher.port';
import type { User, UserRole } from '../domain/user';
import type {
  UpdateUserData,
  UserRepositoryPort,
} from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  teamId?: string | null;
  active?: boolean;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    const existing = await this.users.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const updateData: UpdateUserData = {};

    if (input.firstName !== undefined) {
      updateData.firstName = input.firstName.trim();
    }
    if (input.lastName !== undefined) {
      updateData.lastName = input.lastName.trim();
    }
    if (input.role !== undefined) {
      updateData.role = input.role;
    }
    if (input.teamId !== undefined) {
      updateData.teamId = input.teamId;
    }
    if (input.active !== undefined) {
      updateData.active = input.active;
    }

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      if (email !== existing.email) {
        const userWithEmail = await this.users.findByEmail(email);
        if (userWithEmail && userWithEmail.id !== id) {
          throw new ConflictException('E-mail já cadastrado.');
        }
      }
      updateData.email = email;
    }

    if (input.password !== undefined && input.password.trim().length > 0) {
      updateData.passwordHash = await this.hasher.hash(input.password);
    }

    return this.users.update(id, updateData);
  }
}
