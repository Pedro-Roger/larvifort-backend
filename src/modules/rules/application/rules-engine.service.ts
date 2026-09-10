import { Inject, Injectable } from '@nestjs/common';
import type {
  Rule,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '../domain/rule';
import type { RuleRepositoryPort } from './ports/rule-repository.port';
import type { RulesEnginePort } from './ports/rules-engine.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class RulesEngineService implements RulesEnginePort {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async evaluate(
    context: RuleEvaluationContext,
  ): Promise<RuleEvaluationResult> {
    const applicableRules = await this.rules.findApplicableRules({
      userId: context.userId,
      userRole: context.userRole,
      teamId: context.teamId,
      projectId: context.projectId,
      columnId: context.columnId,
    });

    // Sort by priority (higher first)
    const sortedRules = applicableRules
      .filter((r) => r.active)
      .sort((a, b) => b.priority - a.priority);

    const result: RuleEvaluationResult = {
      allowed: true,
      requiredFields: [],
      setFields: {},
      triggeredAutomations: [],
      blockingRules: [],
    };

    for (const rule of sortedRules) {
      if (!this.matchesConditions(rule, context)) {
        continue;
      }

      switch (rule.action) {
        case 'DENY_MOVE':
          result.allowed = false;
          result.blockingRules.push(rule.id);
          break;
        case 'ALLOW_MOVE':
          result.allowed = true;
          break;
        case 'REQUIRE_FIELD':
          if (rule.parameters.fields) {
            for (const field of rule.parameters.fields as string[]) {
              if (!result.requiredFields.includes(field)) {
                result.requiredFields.push(field);
              }
            }
          }
          break;
        case 'SET_FIELD':
          if (rule.parameters.fields) {
            Object.assign(result.setFields, rule.parameters.fields);
          }
          break;
        case 'TRIGGER_AUTOMATION':
          if (rule.parameters.automationId) {
            result.triggeredAutomations.push(
              rule.parameters.automationId as string,
            );
          }
          break;
      }
    }

    return result;
  }

  private matchesConditions(
    rule: Rule,
    context: RuleEvaluationContext,
  ): boolean {
    const conditions = rule.conditions;

    // Check userId match
    if (conditions.userId && conditions.userId !== context.userId) {
      return false;
    }

    // Check teamId match
    if (conditions.teamId && conditions.teamId !== context.teamId) {
      return false;
    }

    // Check role match
    if (conditions.role && conditions.role !== context.userRole) {
      return false;
    }

    // Check projectId match
    if (conditions.projectId && conditions.projectId !== context.projectId) {
      return false;
    }

    // Check columnId match
    if (conditions.columnId && conditions.columnId !== context.columnId) {
      return false;
    }

    // Check fromColumnId match
    if (
      conditions.fromColumnId &&
      conditions.fromColumnId !== context.fromColumnId
    ) {
      return false;
    }

    // Check toColumnId match
    if (conditions.toColumnId && conditions.toColumnId !== context.toColumnId) {
      return false;
    }

    // Check custom conditions (taskData fields)
    if (conditions.taskData) {
      const taskDataConditions = conditions.taskData as Record<string, unknown>;
      for (const [key, value] of Object.entries(taskDataConditions)) {
        if (context.taskData[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }
}
