import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'LarviFort CRM',
    description: 'Nome do projeto',
  })
  @IsString({ message: 'Nome do projeto é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Nome do projeto não pode ser vazio.' })
  name!: string;

  @ApiPropertyOptional({
    example: ['Backlog', 'Em Andamento', 'Em Revisão', 'Concluído'],
    description: 'Colunas iniciais personalizadas para o projeto',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'initialColumns deve ser um array de strings.' })
  @IsString({ each: true, message: 'Cada coluna deve ser texto.' })
  initialColumns?: string[];
}
