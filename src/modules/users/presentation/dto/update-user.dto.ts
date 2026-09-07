import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../domain/user';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser texto.' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser texto.' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
  password?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], { message: 'Role deve ser ADMIN ou USER.' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  teamId?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
