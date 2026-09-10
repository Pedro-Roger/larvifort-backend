import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { Rule } from '../domain/rule';
import type {
  RuleRepositoryPort,
  FindRulesFilter,
} from './ports/rule-repository.port';
import { RULE_REPOSITORY_PORT } from './ports/rule-repository.port';

@Injectable()
export class ListRulesUseCase {
  constructor(
    @Inject(RULE_REPOSITORY_PORT)
    private readonly rules: RuleRepositoryPort,
  ) {}

  async execute(filter: FindRulesFilter): Promise<Paginated<Rule>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.rules.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
