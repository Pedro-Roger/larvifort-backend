import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Rule } from '../domain/rule';
import { CreateRuleUseCase } from '../application/create-rule.usecase';
import { ListRulesUseCase } from '../application/list-rules.usecase';
import { FindRulesQueryDto } from './dto/find-rules-query.dto';
import { CreateRuleDto } from './dto/create-rule.dto';

@Controller('tasks/boards/:boardId/rules')
@UseGuards(JwtAuthGuard)
export class BoardRulesController {
  constructor(
    private readonly listRules: ListRulesUseCase,
    private readonly createRule: CreateRuleUseCase,
  ) {}

  @Get()
  findByBoard(
    @Param('boardId') boardId: string,
    @Query() query: FindRulesQueryDto,
  ): Promise<Paginated<Rule>> {
    return this.listRules.execute({ ...query, projectId: boardId });
  }

  @Post()
  createForBoard(
    @Param('boardId') boardId: string,
    @Body() dto: CreateRuleDto,
  ): Promise<Rule> {
    return this.createRule.execute({
      ...dto,
      projectId: dto.projectId || boardId,
    });
  }

  @Patch('reorder')
  @HttpCode(204)
  async reorderBoardRules(): Promise<void> {
    // A ordenação ainda não é persistida, mas a rota permanece compatível com o front.
  }
}
