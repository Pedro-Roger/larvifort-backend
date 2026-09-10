import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RuleRepositoryPort } from './ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class DeleteRuleUseCase {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.rules.findById(id);
    if (!existing) {
      throw new NotFoundException('Regra não encontrada.');
    }
    await this.rules.delete(id);
  }
}
