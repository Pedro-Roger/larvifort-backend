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
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { AutomationEngineService } from '../application/automation-engine.service';
import { ManageAutomationsUseCase } from '../application/manage-automations.usecase';
import type { Automation, AutomationExecution } from '../domain/automation';
import {
  CreateAutomationDto,
  DryRunAutomationDto,
  HistoryQueryDto,
  ReorderAutomationsDto,
  UpdateAutomationDto,
} from './dto/automation.dto';

@Controller('projects/:projetoId/automations')
@UseGuards(JwtAuthGuard)
export class AutomationsController {
  constructor(
    private readonly manage: ManageAutomationsUseCase,
    private readonly engine: AutomationEngineService,
  ) {}

  @Get()
  list(@Param('projetoId') projetoId: string): Promise<Automation[]> {
    return this.manage.list(projetoId);
  }

  @Get('history')
  history(
    @Param('projetoId') projetoId: string,
    @Query() query: HistoryQueryDto,
  ): Promise<AutomationExecution[]> {
    return this.manage.history(projetoId, query.limit);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<Automation> {
    return this.manage.get(id);
  }

  @Post()
  create(
    @Param('projetoId') projetoId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAutomationDto,
  ): Promise<Automation> {
    return this.manage.create({ ...dto, projetoId, createdBy: userId });
  }

  @Patch('reorder')
  @HttpCode(204)
  async reorder(
    @Param('projetoId') projetoId: string,
    @Body() dto: ReorderAutomationsDto,
  ): Promise<void> {
    await this.manage.reorder(projetoId, dto.ids);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAutomationDto,
  ): Promise<Automation> {
    return this.manage.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string): Promise<Automation> {
    return this.manage.toggle(id);
  }

  @Post(':id/dry-run')
  async dryRun(
    @Param('id') id: string,
    @Body() dto: DryRunAutomationDto,
  ): Promise<{ matched: boolean; actions: Automation['actions'] }> {
    return this.engine.dryRun(await this.manage.get(id), dto.payload);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.manage.remove(id);
  }
}
