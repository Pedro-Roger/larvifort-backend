import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../domain/user';

export class CreateUserDto {
  @IsString({ message: 'Nome deve ser texto.' })
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  firstName!: string;

  @IsString({ message: 'Sobrenome deve ser texto.' })
  @IsOptional()
  lastName!: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email!: string;

  @IsString({ message: 'Senha deve ser texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
  password!: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], { message: 'Role deve ser ADMIN ou USER.' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
