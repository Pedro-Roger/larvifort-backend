import { Inject, Injectable } from '@nestjs/common';
import type { Rule } from '../domain/rule';
import type {
  RuleRepositoryPort,
  UpdateRuleData,
} from './ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class UpdateRuleUseCase {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateRuleData): Promise<Rule> {
    return this.rules.update(id, data);
  }
}
