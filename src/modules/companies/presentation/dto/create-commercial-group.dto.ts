import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommercialGroupDto {
  @IsString({ message: 'Nome do grupo é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Nome do grupo não pode ser vazio.' })
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}
