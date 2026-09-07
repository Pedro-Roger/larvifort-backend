import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { BcryptPasswordHasher } from '../auth/infra/bcrypt-password-hasher';
import { PASSWORD_HASHER_PORT } from '../auth/application/ports/password-hasher.port';
import { ListUsersUseCase } from './application/list-users.usecase';
import { GetUserByIdUseCase } from './application/get-user-by-id.usecase';
import { CreateUserUseCase } from './application/create-user.usecase';
import { UpdateUserUseCase } from './application/update-user.usecase';
import { DeleteUserUseCase } from './application/delete-user.usecase';
import { UpdateMeUseCase } from './application/update-me.usecase';
import { USER_REPOSITORY_PORT } from './application/ports/user-repository.port';
import {
  PRISMA_USERS_TOKEN,
  PrismaUserRepository,
} from './infra/user.prisma.repository';
import { UsersController } from './presentation/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    ListUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateMeUseCase,
    PrismaUserRepository,
    BcryptPasswordHasher,
    { provide: PRISMA_USERS_TOKEN, useExisting: PrismaService },
    { provide: USER_REPOSITORY_PORT, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordHasher },
  ],
  exports: [
    USER_REPOSITORY_PORT,
    ListUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateMeUseCase,
  ],
})
export class UsersModule {}
