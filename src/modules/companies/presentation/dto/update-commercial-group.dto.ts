import { IsOptional, IsString } from 'class-validator';

export class UpdateCommercialGroupDto {
  @IsOptional()
  @IsString({ message: 'Nome do grupo deve ser texto.' })
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
