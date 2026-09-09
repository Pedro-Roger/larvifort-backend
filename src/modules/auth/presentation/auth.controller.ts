import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { LoginUseCase } from '../application/login.usecase';
import { RegisterUseCase } from '../application/register.usecase';
import { GetProfileUseCase } from '../application/get-profile.usecase';
import { LogoutUseCase } from '../application/logout.usecase';
import type { LoginResult } from '../application/login.usecase';
import type { RegisterResult } from '../application/register.usecase';
import type { AuthenticatedUser } from '../domain/auth-user';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Autenticação')
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
  @ApiOperation({ summary: 'Autentica usuário e emite tokens JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  loginWithCredentials(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra uma nova conta de usuário' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  profile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ): Promise<AuthenticatedUser> {
    return this.getProfileUseCase.execute(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  me(
    @CurrentUser() user: { id: string; email: string; role: string },
  ): Promise<AuthenticatedUser> {
    return this.getProfileUseCase.execute(user.id);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoga os refresh tokens do usuário' })
  async logout(
    @CurrentUser() user: { id: string; email: string; role: string },
  ): Promise<{ message: string }> {
    await this.logoutUseCase.execute(user.id);
    return { message: 'Logout realizado com sucesso.' };
  }
}
