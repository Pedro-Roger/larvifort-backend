import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmActivityDto {
  @ApiProperty({
    description: 'Latitude do check-in (-90 a 90)',
    example: -3.7319,
  })
  @IsNumber({}, { message: 'Latitude deve ser um número válido.' })
  @Min(-90, { message: 'Latitude mínima é -90.' })
  @Max(90, { message: 'Latitude máxima é 90.' })
  @IsNotEmpty({ message: 'Latitude é obrigatória.' })
  latitude!: number;

  @ApiProperty({
    description: 'Longitude do check-in (-180 a 180)',
    example: -38.5267,
  })
  @IsNumber({}, { message: 'Longitude deve ser um número válido.' })
  @Min(-180, { message: 'Longitude mínima é -180.' })
  @Max(180, { message: 'Longitude máxima é 180.' })
  @IsNotEmpty({ message: 'Longitude é obrigatória.' })
  longitude!: number;

  @ApiProperty({ description: 'Precisão em metros', example: 15.5 })
  @IsNumber({}, { message: 'Precisão deve ser um número válido.' })
  @Min(0, { message: 'Precisão deve ser positiva.' })
  @IsNotEmpty({ message: 'Precisão é obrigatória.' })
  accuracyMeters!: number;
}
