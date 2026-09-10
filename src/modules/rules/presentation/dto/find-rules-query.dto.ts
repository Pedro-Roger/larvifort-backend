import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../../core/common/pagination';
import type { RuleScope } from '../../domain/rule';

export class FindRulesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['USER', 'TEAM', 'ROLE', 'COLUMN'], { message: 'Escopo inválido.' })
  scope?: RuleScope;

  @IsOptional()
  @IsString()
  scopeId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsEnum([true, false], { message: 'Ativo deve ser true ou false.' })
  active?: boolean;
}
