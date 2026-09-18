import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateLabWorkOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stockUnitId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stockUnitName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stockLocationId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stockLocationName?: string | null;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
}
