import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { RuleScope, RuleAction } from '../../domain/rule';

export class CreateRuleDto {
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Escopo é obrigatório.' })
  @IsEnum(['USER', 'TEAM', 'ROLE', 'COLUMN'], { message: 'Escopo inválido.' })
  scope!: RuleScope;

  @IsOptional()
  @IsString()
  scopeId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsNotEmpty({ message: 'Ação é obrigatória.' })
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
  action!: RuleAction;

  @IsNotEmpty({ message: 'Condições são obrigatórias.' })
  @IsObject()
  conditions!: Record<string, unknown>;

  @IsNotEmpty({ message: 'Parâmetros são obrigatórios.' })
  @IsObject()
  parameters!: Record<string, unknown>;

  @IsOptional()
  priority?: number;

  @IsOptional()
  active?: boolean;
}
