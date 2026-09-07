import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser texto.' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email?: string;
}
