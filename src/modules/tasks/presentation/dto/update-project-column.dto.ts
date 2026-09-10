import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProjectColumnDto {
  @ApiPropertyOptional({
    example: 'Em Desenvolvimento',
    description: 'Novo título da coluna',
  })
  @IsOptional()
  @IsString({ message: 'Título da coluna deve ser texto.' })
  title?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Nova ordem da coluna',
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro.' })
  @Min(0, { message: 'Ordem deve ser maior ou igual a zero.' })
  order?: number;

  @ApiPropertyOptional({
    example: '#10b981',
    description: 'Nova cor da coluna',
  })
  @IsOptional()
  @IsString({ message: 'Cor deve ser texto.' })
  color?: string;
}
