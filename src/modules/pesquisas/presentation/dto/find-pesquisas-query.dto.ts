import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../../core/common/pagination';

export class FindPesquisasQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  somenteLarvifort?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  de?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  ate?: Date;
}
