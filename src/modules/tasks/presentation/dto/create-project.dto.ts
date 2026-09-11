import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProjectColumnInlineDto {
  @ApiProperty({ example: 'Em Atendimento', description: 'Nome da coluna' })
  @IsString({ message: 'Nome da coluna é obrigatório.' })
  @IsNotEmpty({ message: 'Nome da coluna não pode ser vazio.' })
  name!: string;

  @ApiPropertyOptional({
    example: '#8b5cf6',
    description: 'Cor da coluna em HEX ou token',
  })
  @IsOptional()
  @IsString({ message: 'Cor da coluna deve ser texto.' })
  color?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Ordem de exibição da coluna',
  })
  @IsOptional()
  @IsInt({ message: 'Ordem da coluna deve ser número inteiro.' })
  @Min(0, { message: 'Ordem da coluna deve ser maior ou igual a zero.' })
  order?: number;
}

export class CreateProjectDto {
  @ApiProperty({
    example: 'Atendimento de clientes',
    description: 'Nome do projeto',
  })
  @IsString({ message: 'Nome do projeto é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Nome do projeto não pode ser vazio.' })
  name!: string;

  @ApiPropertyOptional({
    example: 'atendimento',
    description:
      'ID do template opt-in (vazio, pipeline-comercial, atendimento, operacoes, desenvolvimento)',
  })
  @IsOptional()
  @IsString({ message: 'templateId deve ser texto.' })
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Colunas ricas personalizadas para criação do projeto',
    type: [CreateProjectColumnInlineDto],
  })
  @IsOptional()
  @IsArray({ message: 'columns deve ser um array.' })
  @ValidateNested({ each: true })
  @Type(() => CreateProjectColumnInlineDto)
  columns?: CreateProjectColumnInlineDto[];

  @ApiPropertyOptional({
    example: ['Backlog', 'Em Andamento', 'Em Revisão', 'Concluído'],
    description:
      'Colunas iniciais personalizadas para o projeto (nomes simples)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'initialColumns deve ser um array de strings.' })
  @IsString({ each: true, message: 'Cada coluna deve ser texto.' })
  initialColumns?: string[];
}
