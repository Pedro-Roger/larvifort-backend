import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { AuthUserLookupPort } from './ports/auth-user-lookup.port';
import { AUTH_USER_LOOKUP_PORT } from './ports/auth-user-lookup.port';
import { AUTH_USER_WRITER_PORT } from './ports/auth-user-writer.port';
import type { AuthUserWriterPort } from './ports/auth-user-writer.port';
import { PASSWORD_HASHER_PORT } from './ports/password-hasher.port';
import type { PasswordHasherPort } from './ports/password-hasher.port';
import type { AuthRole } from '../domain/auth-user';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
}

// TASK 01 slice 3d — registro de usuário.
// Fluxo: normaliza e-mail → verifica duplicado (porta de leitura) →
// hasheia senha (hasherPort) → persiste via porta de escrita → devolve
// a conta criada (sem passwordHash).
// 409 quando o e-mail já existe; 400 defensivo em dados incompletos
// (o DTO já valida antes); nunca vaza o hash no retorno.
// Injeção via tokens (interfaces não existem em runtime); construção
// manual `new RegisterUseCase(users, writers, hasher)` segue válida.
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_USER_LOOKUP_PORT)
    private readonly users: AuthUserLookupPort,
    @Inject(AUTH_USER_WRITER_PORT)
    private readonly writers: AuthUserWriterPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const firstName = input.firstName?.trim() ?? '';
    const lastName = input.lastName?.trim() ?? '';
    const password = input.password ?? '';
    if (!email || !firstName || !lastName || !password) {
      throw new BadRequestException('Dados de registro incompletos.');
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    const passwordHash = await this.hasher.hash(password);
    const created = await this.writers.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: 'USER',
      active: true,
    });
    return {
      id: created.id,
      email: created.email,
      firstName,
      lastName,
      role: created.role,
    };
  }
}
