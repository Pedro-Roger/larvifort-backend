import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerChangeRequestDto {
  @ApiProperty({
    example: 'El cliente pide cambiar la cantidad de 10 a 15 milheiros.',
    description: 'Descripción del cambio solicitado',
  })
  @IsString({ message: 'La descripción del cambio es obligatoria.' })
  @IsNotEmpty({ message: 'La descripción del cambio no puede estar vacía.' })
  note!: string;
}
