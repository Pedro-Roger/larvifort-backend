import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    example: 'Cliente optou por adiar a compra para o próximo ciclo',
    description: 'Motivo do cancelamento (obrigatório)',
  })
  @IsString({ message: 'Motivo de cancelamento deve ser texto.' })
  @IsNotEmpty({ message: 'Motivo de cancelamento é obrigatório.' })
  reason!: string;
}
