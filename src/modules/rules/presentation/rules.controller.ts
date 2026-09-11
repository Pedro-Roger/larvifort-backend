import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Rule } from '../domain/rule';
import { CreateRuleUseCase } from '../application/create-rule.usecase';
import { ListRulesUseCase } from '../application/list-rules.usecase';
import { GetRuleByIdUseCase } from '../application/get-rule.usecase';
import { UpdateRuleUseCase } from '../application/update-rule.usecase';
import { DeleteRuleUseCase } from '../application/delete-rule.usecase';
import { FindRulesQueryDto } from './dto/find-rules-query.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Controller(['rules', 'tasks/rules'])
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(
    private readonly listRules: ListRulesUseCase,
    private readonly createRule: CreateRuleUseCase,
    private readonly getRuleById: GetRuleByIdUseCase,
    private readonly updateRule: UpdateRuleUseCase,
    private readonly deleteRule: DeleteRuleUseCase,
  ) {}

  @Get()
  findMany(@Query() query: FindRulesQueryDto): Promise<Paginated<Rule>> {
    return this.listRules.execute(query);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Rule> {
    return this.getRuleById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateRuleDto): Promise<Rule> {
    return this.createRule.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto): Promise<Rule> {
    return this.updateRule.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteRule.execute(id);
  }
}
