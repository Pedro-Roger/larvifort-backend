import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubtaskDto {
  @ApiProperty({ example: 'Ligar para o cliente' })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiPropertyOptional({ example: 'Confirmar disponibilidade' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'user-2' })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
