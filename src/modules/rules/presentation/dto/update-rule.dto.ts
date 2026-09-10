import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import type { RuleScope, RuleAction } from '../../domain/rule';

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsEnum(
    [
      'ALLOW_MOVE',
      'DENY_MOVE',
      'REQUIRE_FIELD',
      'SET_FIELD',
      'TRIGGER_AUTOMATION',
    ],
    {
      message: 'Ação inválida.',
    },
  )
  action?: RuleAction;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  priority?: number;

  @IsOptional()
  active?: boolean;
}
