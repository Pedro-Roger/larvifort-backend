import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  AutomationActionType,
  AutomationTrigger,
  ConditionOperator,
} from '../../domain/automation';

const TRIGGERS: AutomationTrigger[] = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_MOVED',
  'TASK_ASSIGNED',
  'TASK_DUE_SOON',
  'TASK_OVERDUE',
];
const OPERATORS: ConditionOperator[] = [
  'EQUALS',
  'NOT_EQUALS',
  'CONTAINS',
  'IN',
  'EXISTS',
];
const ACTIONS: AutomationActionType[] = [
  'MOVE_TASK',
  'ASSIGN_TASK',
  'SET_PRIORITY',
  'ADD_TAG',
  'REMOVE_TAG',
  'SET_DUE_DATE',
  'CREATE_LINKED_TASK',
  'NOTIFY',
];

export class AutomationConditionDto {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsEnum(OPERATORS)
  operator!: ConditionOperator;

  @IsOptional()
  value?: unknown;
}

export class AutomationActionDto {
  @IsEnum(ACTIONS)
  type!: AutomationActionType;

  @IsObject()
  params!: Record<string, unknown>;
}

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TRIGGERS)
  trigger!: AutomationTrigger;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AutomationConditionDto)
  conditions!: AutomationConditionDto[];

  @IsOptional()
  @IsEnum(['AND', 'OR'])
  conditionMode?: 'AND' | 'OR';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AutomationActionDto)
  actions!: AutomationActionDto[];

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}

export class UpdateAutomationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TRIGGERS)
  trigger?: AutomationTrigger;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AutomationConditionDto)
  conditions?: AutomationConditionDto[];

  @IsOptional()
  @IsEnum(['AND', 'OR'])
  conditionMode?: 'AND' | 'OR';

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AutomationActionDto)
  actions?: AutomationActionDto[];

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}

export class ReorderAutomationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];
}

export class DryRunAutomationDto {
  @IsObject()
  payload!: Record<string, unknown>;
}

export class HistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
