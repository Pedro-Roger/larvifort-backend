export type AutomationTrigger =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_MOVED'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE';

export type ConditionOperator =
  'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN' | 'EXISTS';

export interface AutomationCondition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export type AutomationActionType =
  | 'MOVE_TASK'
  | 'ASSIGN_TASK'
  | 'SET_PRIORITY'
  | 'ADD_TAG'
  | 'REMOVE_TAG'
  | 'SET_DUE_DATE'
  | 'CREATE_LINKED_TASK'
  | 'NOTIFY';

export interface AutomationAction {
  type: AutomationActionType;
  params: Record<string, unknown>;
}

export interface Automation {
  id: string;
  projetoId: string;
  name: string;
  description: string | null;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  conditionMode: 'AND' | 'OR';
  actions: AutomationAction[];
  schedule: string | null;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AutomationEvent {
  id: string;
  type: AutomationTrigger;
  projetoId: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  depth: number;
  causationChain: string[];
  occurredAt: Date;
}

export type AutomationExecutionResult =
  'RUNNING' | 'SUCCESS' | 'SKIPPED' | 'FAILED';

export interface AutomationExecution {
  id: string;
  automationId: string;
  eventId: string;
  attempt: number;
  durationMs: number | null;
  result: AutomationExecutionResult;
  error: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
