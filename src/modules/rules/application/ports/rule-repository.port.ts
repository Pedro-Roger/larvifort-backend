import type { Rule, RuleScope } from '../../domain/rule';

export const RULE_REPOSITORY_PORT = 'RULE_REPOSITORY_PORT';

export interface FindRulesFilter {
  scope?: RuleScope;
  scopeId?: string;
  projectId?: string;
  columnId?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface CreateRuleData {
  name: string;
  description?: string | null;
  scope: RuleScope;
  scopeId?: string | null;
  projectId?: string | null;
  columnId?: string | null;
  action:
    | 'ALLOW_MOVE'
    | 'DENY_MOVE'
    | 'REQUIRE_FIELD'
    | 'SET_FIELD'
    | 'TRIGGER_AUTOMATION';
  conditions: Record<string, unknown>;
  parameters: Record<string, unknown>;
  priority?: number;
  active?: boolean;
}

export interface UpdateRuleData {
  name?: string | null;
  description?: string | null;
  scope?: RuleScope | null;
  scopeId?: string | null;
  projectId?: string | null;
  columnId?: string | null;
  action?:
    | 'ALLOW_MOVE'
    | 'DENY_MOVE'
    | 'REQUIRE_FIELD'
    | 'SET_FIELD'
    | 'TRIGGER_AUTOMATION'
    | null;
  conditions?: Record<string, unknown> | null;
  parameters?: Record<string, unknown> | null;
  priority?: number | null;
  active?: boolean | null;
}

export interface RuleRepositoryPort {
  findMany(filter: FindRulesFilter): Promise<{ data: Rule[]; total: number }>;
  findById(id: string): Promise<Rule | null>;
  findApplicableRules(context: {
    userId: string;
    userRole: 'ADMIN' | 'USER';
    teamId: string | null;
    projectId: string;
    columnId: string | null;
  }): Promise<Rule[]>;
  create(data: CreateRuleData): Promise<Rule>;
  update(id: string, data: UpdateRuleData): Promise<Rule>;
  delete(id: string): Promise<void>;
}
