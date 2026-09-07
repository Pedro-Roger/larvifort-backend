import { Inject, Injectable } from '@nestjs/common';
import type { User } from '../../modules/auth/domain/auth-user';
import type { AuthUserLookupPort } from '../../modules/auth/application/ports/auth-user-lookup.port';
import { AUTH_USER_LOOKUP_PORT } from '../../modules/auth/application/ports/auth-user-lookup.port';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class PrismaAuthUserLookupRepository implements AuthUserLookupPort {
  constructor(
    @Inject() private readonly prisma: PrismaService,
  ) {}

  async findByEmail(email: string): Promise<{ id: string; email: string; passwordHash: string; role: UserRole; active: boolean } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });
    return user ? { id: user.id, email: user.email, passwordHash: user.passwordHash, role: user.role as UserRole, active: user.active } : null;
  }
}