import { Inject } from '@nestjs/common';
import type { User } from '../../modules/auth/domain/auth-user';
import type { NewAuthUser } from '../../modules/auth/application/ports/auth-user-writer.port';
import { AUTH_USER_WRITER_PORT } from '../../modules/auth/application/ports/auth-user-writer.port';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class PrismaAuthUserWriterRepository implements AuthUserWriterPort {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async create(data: NewAuthUser): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash: '', // senha será setada posteriormente ou via login
        role: 'USER',
        active: true,
      },
      select: { id: true, email: true },
    });
    return { id: user.id, email: user.email };
  }
}