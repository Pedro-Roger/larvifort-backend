import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAvailabilityQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por producto' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por unidad' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por local/berçário' })
  @IsOptional()
  @IsString()
  locationId?: string;
}
