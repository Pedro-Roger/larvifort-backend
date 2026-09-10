// FASE 5 - API-008 — entidade pura de domínio para Regras Personalizadas.
// Espelha o modelo Rule do schema Prisma sem importar @prisma/client (regra do Repository).

export type RuleScope = 'USER' | 'TEAM' | 'ROLE' | 'COLUMN';

export type RuleAction =
  | 'ALLOW_MOVE'
  | 'DENY_MOVE'
  | 'REQUIRE_FIELD'
  | 'SET_FIELD'
  | 'TRIGGER_AUTOMATION';

export interface Rule {
  id: string;
  name: string;
  description: string | null;
  scope: RuleScope;
  scopeId: string | null;
  projectId: string | null;
  columnId: string | null;
  action: RuleAction;
  conditions: Record<string, unknown>;
  parameters: Record<string, unknown>;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleEvaluationContext {
  userId: string;
  userRole: 'ADMIN' | 'USER';
  teamId: string | null;
  projectId: string;
  columnId: string | null;
  taskId: string;
  fromColumnId: string | null;
  toColumnId: string | null;
  taskData: Record<string, unknown>;
}

export interface RuleEvaluationResult {
  allowed: boolean;
  requiredFields: string[];
  setFields: Record<string, unknown>;
  triggeredAutomations: string[];
  blockingRules: string[];
}
