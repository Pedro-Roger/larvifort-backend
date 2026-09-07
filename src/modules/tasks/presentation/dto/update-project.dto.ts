import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString({ message: 'Nome do projeto é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Nome do projeto não pode ser vazio.' })
  name!: string;
}
