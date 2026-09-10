import { Module } from '@nestjs/common';
import { LoginUseCase } from './application/login.usecase';
import { RegisterUseCase } from './application/register.usecase';
import { GetProfileUseCase } from './application/get-profile.usecase';
import { LogoutUseCase } from './application/logout.usecase';
import { RefreshUseCase } from './application/refresh.use-case';
import { AUTH_USER_LOOKUP_PORT } from './application/ports/auth-user-lookup.port';
import { HASH_COMPARE_PORT } from './application/ports/hash-compare.port';
import { JWT_TOKEN_ISSUER_PORT } from './application/ports/token-issuer.port';
import { AUTH_USER_WRITER_PORT } from './application/ports/auth-user-writer.port';
import { PASSWORD_HASHER_PORT } from './application/ports/password-hasher.port';
import { REFRESH_TOKEN_PORT } from './application/ports/refresh-token.port';
import { JwtTokenIssuer } from './infra/jwt-token-issuer';
import { BcryptHashCompare } from './infra/bcrypt-hash-compare';
import { BcryptPasswordHasher } from './infra/bcrypt-password-hasher';
import { PrismaAuthUserLookupRepository } from './infra/auth-user-lookup.prisma.repository';
import { PrismaAuthUserWriterRepository } from './infra/auth-user-writer.prisma.repository';
import { PrismaRefreshTokenRepository } from './infra/refresh-token.prisma.repository';
import { AuthController } from './presentation/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    GetProfileUseCase,
    LogoutUseCase,
    RefreshUseCase,
    PrismaAuthUserLookupRepository,
    PrismaAuthUserWriterRepository,
    PrismaRefreshTokenRepository,
    BcryptHashCompare,
    BcryptPasswordHasher,
    {
      provide: AUTH_USER_LOOKUP_PORT,
      useClass: PrismaAuthUserLookupRepository,
    },
    { provide: HASH_COMPARE_PORT, useClass: BcryptHashCompare },
    {
      provide: AUTH_USER_WRITER_PORT,
      useClass: PrismaAuthUserWriterRepository,
    },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordHasher },
    { provide: REFRESH_TOKEN_PORT, useClass: PrismaRefreshTokenRepository },
    {
      provide: JWT_TOKEN_ISSUER_PORT,
      useFactory: () =>
        new JwtTokenIssuer(
          process.env.JWT_SECRET ?? 'lavifort-dev-secret',
          process.env.JWT_EXPIRES_IN ?? '7d',
        ),
    },
  ],
  exports: [
    LoginUseCase,
    RegisterUseCase,
    GetProfileUseCase,
    LogoutUseCase,
    RefreshUseCase,
  ],
})
export class AuthModule {}
