import { Inject, Injectable } from '@nestjs/common';
import type { UserRole } from '../domain/auth-user';
import type { AuthUserLookupPort } from '../application/ports/auth-user-lookup.port';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class PrismaAuthUserLookupRepository implements AuthUserLookupPort {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    active: boolean;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });
    return user
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          active: user.active,
        }
      : null;
  }

  async findById(id: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    active: boolean;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        active: true,
      },
    });
    return user
      ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          active: user.active,
        }
      : null;
  }
}
