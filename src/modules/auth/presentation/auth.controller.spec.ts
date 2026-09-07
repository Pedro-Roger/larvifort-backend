import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import type { LoginUseCase } from '../application/login.usecase';
import type { RegisterUseCase } from '../application/register.usecase';
import type { GetProfileUseCase } from '../application/get-profile.usecase';
import type { LogoutUseCase } from '../application/logout.usecase';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Spec da camada presentation: controller delega ao usecase com os
// campos do DTO e repassa sucesso/erro (401 login, 409 register, 401 profile, 200 logout).
describe('AuthController', () => {
  function makeSut() {
    const loginExecute = jest.fn();
    const registerExecute = jest.fn();
    const profileExecute = jest.fn();
    const logoutExecute = jest.fn();
    const login = { execute: loginExecute } as unknown as LoginUseCase;
    const register = { execute: registerExecute } as unknown as RegisterUseCase;
    const getProfile = {
      execute: profileExecute,
    } as unknown as GetProfileUseCase;
    const logoutUseCase = {
      execute: logoutExecute,
    } as unknown as LogoutUseCase;
    const sut = new AuthController(login, register, getProfile, logoutUseCase);
    return {
      sut,
      loginExecute,
      registerExecute,
      profileExecute,
      logoutExecute,
    };
  }

  function makeLoginDto(): LoginDto {
    const dto = new LoginDto();
    dto.email = 'fernando@lavifort.com.br';
    dto.password = 'Lavifort@123';
    return dto;
  }

  function makeRegisterDto(): RegisterDto {
    const dto = new RegisterDto();
    dto.firstName = 'Maria';
    dto.lastName = 'Lima';
    dto.email = 'maria@lavifort.com.br';
    dto.password = 'Lavifort@123';
    return dto;
  }

  it('delega email/password ao LoginUseCase e retorna { accessToken, user }', async () => {
    const { sut, loginExecute } = makeSut();
    loginExecute.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
    });
    const result = await sut.loginWithCredentials(makeLoginDto());
    expect(loginExecute).toHaveBeenCalledWith({
      email: 'fernando@lavifort.com.br',
      password: 'Lavifort@123',
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: { id: 'u-1', email: 'fernando@lavifort.com.br', role: 'ADMIN' },
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('propaga 401 do LoginUseCase sem mascarar', async () => {
    const { sut, loginExecute } = makeSut();
    loginExecute.mockRejectedValue(
      new UnauthorizedException('Credenciais inválidas.'),
    );
    await expect(sut.loginWithCredentials(makeLoginDto())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('delega dados do registro ao RegisterUseCase e retorna a conta', async () => {
    const { sut, registerExecute } = makeSut();
    registerExecute.mockResolvedValue({
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      firstName: 'Maria',
      lastName: 'Lima',
      role: 'USER',
    });
    const result = await sut.registerAccount(makeRegisterDto());
    expect(registerExecute).toHaveBeenCalledWith({
      firstName: 'Maria',
      lastName: 'Lima',
      email: 'maria@lavifort.com.br',
      password: 'Lavifort@123',
    });
    expect(result).toEqual({
      id: 'u-new',
      email: 'maria@lavifort.com.br',
      firstName: 'Maria',
      lastName: 'Lima',
      role: 'USER',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('propaga 409 do RegisterUseCase sem mascarar', async () => {
    const { sut, registerExecute } = makeSut();
    registerExecute.mockRejectedValue(
      new ConflictException('E-mail já cadastrado.'),
    );
    await expect(sut.registerAccount(makeRegisterDto())).rejects.toThrow(
      ConflictException,
    );
  });

  it('delega id ao GetProfileUseCase em GET /auth/profile', async () => {
    const { sut, profileExecute } = makeSut();
    profileExecute.mockResolvedValue({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    const result = await sut.profile({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(profileExecute).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
  });

  it('delega id ao GetProfileUseCase em GET /auth/me', async () => {
    const { sut, profileExecute } = makeSut();
    profileExecute.mockResolvedValue({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    const result = await sut.me({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(profileExecute).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
  });

  it('propaga 401 do GetProfileUseCase sem mascarar', async () => {
    const { sut, profileExecute } = makeSut();
    profileExecute.mockRejectedValue(
      new UnauthorizedException('Usuário não encontrado ou inativo.'),
    );
    await expect(
      sut.profile({
        id: 'u-ghost',
        email: 'ghost@lavifort.com.br',
        role: 'USER',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('delega id ao LogoutUseCase em POST /auth/logout', async () => {
    const { sut, logoutExecute } = makeSut();
    logoutExecute.mockResolvedValue({
      message: 'Logout realizado com sucesso.',
    });
    const result = await sut.logout({
      id: 'u-1',
      email: 'fernando@lavifort.com.br',
      role: 'ADMIN',
    });
    expect(logoutExecute).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ message: 'Logout realizado com sucesso.' });
  });
});
