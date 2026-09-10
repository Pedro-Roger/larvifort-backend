import type {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationExecution,
  AutomationExecutionResult,
  AutomationTrigger,
} from '../../domain/automation';

export const AUTOMATION_REPOSITORY_PORT = 'AUTOMATION_REPOSITORY_PORT';

export interface CreateAutomationData {
  projetoId: string;
  name: string;
  description?: string | null;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  conditionMode?: 'AND' | 'OR';
  actions: AutomationAction[];
  schedule?: string | null;
  isActive?: boolean;
  priority?: number;
  createdBy: string;
}

export type UpdateAutomationData = Partial<
  Omit<CreateAutomationData, 'projetoId' | 'createdBy'>
>;

export interface AutomationRepositoryPort {
  findMany(projetoId: string): Promise<Automation[]>;
  findById(id: string): Promise<Automation | null>;
  findActiveByEvent(
    projetoId: string,
    trigger: AutomationTrigger,
  ): Promise<Automation[]>;
  create(data: CreateAutomationData): Promise<Automation>;
  update(id: string, data: UpdateAutomationData): Promise<Automation>;
  softDelete(id: string): Promise<void>;
  reorder(projetoId: string, ids: string[]): Promise<void>;
  hasExecution(automationId: string, eventId: string): Promise<boolean>;
  createExecution(data: {
    automationId: string;
    eventId: string;
    attempt: number;
  }): Promise<Pick<AutomationExecution, 'id'>>;
  completeExecution(
    id: string,
    data: {
      durationMs: number;
      result: AutomationExecutionResult;
      error: string | null;
    },
  ): Promise<void>;
  findHistory(projetoId: string, limit: number): Promise<AutomationExecution[]>;
}
