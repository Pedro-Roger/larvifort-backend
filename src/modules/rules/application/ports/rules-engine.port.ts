import type {
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '../../domain/rule';

export const RULES_ENGINE_PORT = 'RULES_ENGINE_PORT';

export interface RulesEnginePort {
  evaluate(context: RuleEvaluationContext): Promise<RuleEvaluationResult>;
}
