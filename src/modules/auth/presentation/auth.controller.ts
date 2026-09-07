import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { LoginUseCase } from '../application/login.usecase';
import { RegisterUseCase } from '../application/register.usecase';
import { GetProfileUseCase } from '../application/get-profile.usecase';
import { LogoutUseCase } from '../application/logout.usecase';
import type { LoginResult } from '../application/login.usecase';
import type { RegisterResult } from '../application/register.usecase';
import type { AuthenticatedUser } from '../domain/auth-user';
import type { Paginated } from '../../../core/common/pagination';
import type { User } from '../domain/user';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  loginWithCredentials(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.loginUseCase.execute({ email: dto.email, password: dto.password });
  }

  @Post('register')
  registerAccount(@Body() dto: RegisterDto): Promise<RegisterResult> {
    return this.registerUseCase.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ): Promise<AuthenticatedUser> {
    return { id: user.id, email: user.email, role: user.role as 'ADMIN' | 'USER' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser() user: { id: string; email: string; role: string },
  ): Promise<AuthenticatedUser> {
    return { id: user.id, email: user.email, role: user.role as 'ADMIN' | 'USER' };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: { id: string }): Promise<void> {
    return this.logoutUseCase.execute(user.id);
  }
}