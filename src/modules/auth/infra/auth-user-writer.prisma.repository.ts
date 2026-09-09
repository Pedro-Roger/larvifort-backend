import { Inject, Injectable } from '@nestjs/common';
import type { UserRole } from '../domain/auth-user';
import type {
  NewAuthUser,
  AuthUserWriterPort,
} from '../application/ports/auth-user-writer.port';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class PrismaAuthUserWriterRepository implements AuthUserWriterPort {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async create(
    data: NewAuthUser,
  ): Promise<{ id: string; email: string; role: UserRole }> {
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        active: data.active,
      },
      select: { id: true, email: true, role: true },
    });
    return { id: user.id, email: user.email, role: user.role };
  }
}
