import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderProjectColumnsDto {
  @ApiProperty({
    example: ['col-1', 'col-2', 'col-3'],
    description: 'Lista ordenada de IDs de colunas',
    type: [String],
  })
  @IsArray({ message: 'columnIds deve ser um array.' })
  @ArrayNotEmpty({ message: 'columnIds não pode ser vazio.' })
  @IsString({ each: true, message: 'Cada ID de coluna deve ser texto.' })
  columnIds!: string[];
}
