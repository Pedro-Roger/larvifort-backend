import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerConfirmationDto {
  @ApiPropertyOptional({
    example: 'Cliente confirmó el pedido y la fecha de entrega.',
    description: 'Observación de la confirmación',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
