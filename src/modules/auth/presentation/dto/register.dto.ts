import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Maria' })
  @IsString({ message: 'Nome deve ser texto.' })
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  firstName!: string;

  @ApiProperty({ example: 'Silva' })
  @IsString({ message: 'Sobrenome deve ser texto.' })
  @IsNotEmpty({ message: 'Sobrenome é obrigatório.' })
  lastName!: string;

  @ApiProperty({ example: 'maria@lavifort.com.br' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email!: string;

  @ApiProperty({ example: 'Lavifort@123', minLength: 8, writeOnly: true })
  @IsString({ message: 'Senha deve ser texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
  password!: string;
}
