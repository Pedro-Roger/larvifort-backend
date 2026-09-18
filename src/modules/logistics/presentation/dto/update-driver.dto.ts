import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { DriverStatus } from '../../domain/logistics';

export class UpdateDriverDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() document?: string;
  @IsOptional() @IsEnum(['DISPONIVEL', 'EM_ROTA', 'INDISPONIVEL']) status?: DriverStatus;
  @IsOptional() @IsString() region?: string;
}
