export class RegisterDto {
  @IsString({ message: 'Nome deve ser texto.' })
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  firstName!: string;

  @IsString({ message: 'Sobrenome deve ser texto.' })
  @IsNotEmpty({ message: 'Sobrenome é obrigatório.' })
  lastName!: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email!: string;

  @IsString({ message: 'Senha deve ser texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
  password!: string;
}