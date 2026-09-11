import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { AutomationEngineService } from '../application/automation-engine.service';
import { ManageAutomationsUseCase } from '../application/manage-automations.usecase';
import type { Automation } from '../domain/automation';
import { UpdateAutomationDto } from './dto/automation.dto';

@ApiTags('Automações Diretas')
@ApiBearerAuth('access-token')
@Controller('tasks/automations')
@UseGuards(JwtAuthGuard)
export class DirectAutomationsController {
  constructor(
    private readonly manage: ManageAutomationsUseCase,
    private readonly engine: AutomationEngineService,
  ) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar automação diretamente' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAutomationDto,
  ): Promise<Automation> {
    return this.manage.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir automação diretamente' })
  remove(@Param('id') id: string): Promise<void> {
    return this.manage.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Testar automação diretamente' })
  async testAutomation(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ): Promise<{ success: boolean; logs: string[] }> {
    const automation = await this.manage.get(id);
    const result = this.engine.dryRun(automation, payload);
    return {
      success: result.matched,
      logs: result.matched
        ? [
            `Automação ${automation.name} disparou ${result.actions.length} ações.`,
          ]
        : [`Condições da automação ${automation.name} não foram satisfeitas.`],
    };
  }
}
