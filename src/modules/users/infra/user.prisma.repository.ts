import { Inject, Injectable } from '@nestjs/common';
import type { User, UserRole } from '../domain/user';
import type {
  CreateUserData,
  FindUsersFilter,
  UpdateUserData,
  UserRepositoryPort,
} from '../application/ports/user-repository.port';

export const PRISMA_USERS_TOKEN = 'PRISMA_USERS_TOKEN';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  active: boolean;
  teamId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaUserCrud {
  user: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<UserRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id?: string; email?: string };
      select: Record<string, true>;
    }): Promise<UserRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<UserRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<UserRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  active: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
} as const;

// TASK 02 — adapter Prisma da porta `UserRepositoryPort`.
// Único ponto de acesso ao banco de dados para o Users Module.
@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    @Inject(PRISMA_USERS_TOKEN)
    private readonly prisma: PrismaUserCrud,
  ) {}

  async findMany(
    filter: FindUsersFilter,
  ): Promise<{ data: User[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.teamId !== undefined) {
      where.teamId = filter.teamId;
    }
    if (filter.role !== undefined) {
      where.role = filter.role;
    }
    if (filter.active !== undefined) {
      where.active = filter.active;
    }
    if (filter.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: USER_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER',
        teamId: data.teamId ?? null,
        active: data.active ?? true,
      },
      select: USER_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined)
      updateData.email = data.email.trim().toLowerCase();
    if (data.passwordHash !== undefined)
      updateData.passwordHash = data.passwordHash;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.teamId !== undefined) updateData.teamId = data.teamId;
    if (data.active !== undefined) updateData.active = data.active;

    const row = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(row: UserRow): User {
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      role: row.role,
      active: row.active,
      teamId: row.teamId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
