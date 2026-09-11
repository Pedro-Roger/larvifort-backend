import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateRuleUseCase } from './application/create-rule.usecase';
import { ListRulesUseCase } from './application/list-rules.usecase';
import { GetRuleByIdUseCase } from './application/get-rule.usecase';
import { UpdateRuleUseCase } from './application/update-rule.usecase';
import { DeleteRuleUseCase } from './application/delete-rule.usecase';
import { RulesEngineService } from './application/rules-engine.service';
import { RULE_REPOSITORY_PORT } from './application/ports/rule-repository.port';
import { RULES_ENGINE_PORT } from './application/ports/rules-engine.port';
import {
  PRISMA_RULES_TOKEN,
  PrismaRuleRepository,
} from './infra/rule.prisma.repository';
import { RulesController } from './presentation/rules.controller';
import { BoardRulesController } from './presentation/board-rules.controller';

@Module({
  controllers: [RulesController, BoardRulesController],
  providers: [
    CreateRuleUseCase,
    ListRulesUseCase,
    GetRuleByIdUseCase,
    UpdateRuleUseCase,
    DeleteRuleUseCase,
    RulesEngineService,
    PrismaRuleRepository,
    { provide: RULE_REPOSITORY_PORT, useClass: PrismaRuleRepository },
    { provide: RULES_ENGINE_PORT, useClass: RulesEngineService },
    { provide: PRISMA_RULES_TOKEN, useExisting: PrismaService },
  ],
  exports: [
    RULE_REPOSITORY_PORT,
    RULES_ENGINE_PORT,
    CreateRuleUseCase,
    ListRulesUseCase,
    GetRuleByIdUseCase,
    UpdateRuleUseCase,
    DeleteRuleUseCase,
    RulesEngineService,
  ],
})
export class RulesModule {}
