import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectColumnDto {
  @ApiProperty({
    example: 'Para Fazer',
    description: 'Título da coluna',
  })
  @IsString({ message: 'Título da coluna é obrigatório e deve ser texto.' })
  @IsNotEmpty({ message: 'Título da coluna não pode ser vazio.' })
  title!: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Ordem de exibição da coluna',
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro.' })
  @Min(0, { message: 'Ordem deve ser maior ou igual a zero.' })
  order?: number;

  @ApiPropertyOptional({
    example: '#3b82f6',
    description: 'Cor visual da coluna (hex ou nome)',
  })
  @IsOptional()
  @IsString({ message: 'Cor deve ser texto.' })
  color?: string;
}
