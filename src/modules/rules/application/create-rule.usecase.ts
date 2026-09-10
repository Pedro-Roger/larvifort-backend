import { Inject, Injectable } from '@nestjs/common';
import type { Rule } from '../domain/rule';
import type {
  RuleRepositoryPort,
  CreateRuleData,
} from './ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class CreateRuleUseCase {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async execute(input: CreateRuleData): Promise<Rule> {
    return this.rules.create(input);
  }
}
