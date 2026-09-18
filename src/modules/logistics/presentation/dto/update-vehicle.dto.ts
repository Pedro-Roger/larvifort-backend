import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { VehicleStatus } from '../../domain/logistics';

export class UpdateVehicleDto {
  @IsOptional() @IsString() plate?: string;
  @IsOptional() @IsEnum(['DISPONIVEL', 'EM_ROTA', 'INDISPONIVEL']) status?: VehicleStatus;
}
