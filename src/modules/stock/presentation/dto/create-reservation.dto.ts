import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ example: 'prod-uuid', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'loc-uuid', description: 'ID del local/berçário' })
  @IsString()
  @IsNotEmpty()
  stockLocationId!: string;

  @ApiPropertyOptional({ example: 'order-uuid', description: 'ID del pedido' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ example: 2000, description: 'Cantidad a reservar' })
  @IsNumber()
  quantity!: number;
}
