import { Inject, Injectable } from '@nestjs/common';
import type {
  Automation,
  AutomationCondition,
  AutomationEvent,
} from '../domain/automation';
import {
  AUTOMATION_REPOSITORY_PORT,
  type AutomationRepositoryPort,
} from './ports/automation-repository.port';
import {
  AUTOMATION_ACTION_PORT,
  type AutomationActionPort,
} from './ports/automation-action.port';

const MAX_DEPTH = 5;

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

@Injectable()
export class AutomationEngineService {
  constructor(
    @Inject(AUTOMATION_REPOSITORY_PORT)
    private readonly repository: AutomationRepositoryPort,
    @Inject(AUTOMATION_ACTION_PORT)
    private readonly actionExecutor: AutomationActionPort,
  ) {}

  async process(event: AutomationEvent, attempt: number): Promise<void> {
    if (event.depth >= MAX_DEPTH) return;
    const automations = await this.repository.findActiveByEvent(
      event.projetoId,
      event.type,
    );
    for (const automation of automations) {
      if (
        event.causationChain.includes(automation.id) ||
        (await this.repository.hasExecution(automation.id, event.id))
      ) {
        continue;
      }
      if (!this.matches(automation, event.payload)) continue;
      const execution = await this.repository.createExecution({
        automationId: automation.id,
        eventId: event.id,
        attempt,
      });
      const startedAt = Date.now();
      try {
        for (const action of automation.actions) {
          await this.actionExecutor.execute(action, event);
        }
        await this.repository.completeExecution(execution.id, {
          durationMs: Date.now() - startedAt,
          result: 'SUCCESS',
          error: null,
        });
      } catch (error) {
        await this.repository.completeExecution(execution.id, {
          durationMs: Date.now() - startedAt,
          result: 'FAILED',
          error: this.sanitizeError(error),
        });
        throw new Error('Automation action failed');
      }
    }
  }

  dryRun(automation: Automation, payload: Record<string, unknown>) {
    return {
      matched: this.matches(automation, payload),
      actions: automation.actions,
    };
  }

  private matches(
    automation: Automation,
    payload: Record<string, unknown>,
  ): boolean {
    if (automation.conditions.length === 0) return true;
    const results = automation.conditions.map((condition) =>
      this.matchesCondition(condition, payload),
    );
    return automation.conditionMode === 'OR'
      ? results.some(Boolean)
      : results.every(Boolean);
  }

  private matchesCondition(
    condition: AutomationCondition,
    payload: Record<string, unknown>,
  ): boolean {
    const actual = condition.field
      .split('.')
      .reduce<unknown>(
        (value, key) =>
          value && typeof value === 'object'
            ? (value as Record<string, unknown>)[key]
            : undefined,
        payload,
      );
    switch (condition.operator) {
      case 'EQUALS':
        return actual === condition.value;
      case 'NOT_EQUALS':
        return actual !== condition.value;
      case 'CONTAINS':
        return Array.isArray(actual)
          ? actual.includes(condition.value)
          : safeString(actual).includes(safeString(condition.value));
      case 'IN':
        return Array.isArray(condition.value)
          ? condition.value.includes(actual)
          : false;
      case 'EXISTS':
        return actual !== undefined && actual !== null;
    }
  }

  private sanitizeError(error: unknown): string {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return message
      .replace(
        /(token|password|secret|authorization)\s*[=:]\s*[^\s]+/gi,
        '$1=[REDACTED]',
      )
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 500);
  }
}
