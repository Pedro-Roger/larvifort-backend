import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Rule } from '../domain/rule';
import type { RuleRepositoryPort } from './ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class GetRuleByIdUseCase {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async execute(id: string): Promise<Rule> {
    const rule = await this.rules.findById(id);
    if (!rule) {
      throw new NotFoundException('Regra não encontrada.');
    }
    return rule;
  }
}
