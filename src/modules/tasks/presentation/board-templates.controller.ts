import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { ListProjectTemplatesUseCase } from '../application/list-project-templates.usecase';
import { GetProjectTemplateByIdUseCase } from '../application/get-project-template-by-id.usecase';
import type { Task } from '../domain/task';
import { CreateTaskUseCase } from '../application/create-task.usecase';

export interface BoardTemplateResponse {
  id: string;
  boardId: string;
  name: string;
  description: string;
  enabled: boolean;
  status: string;
  priority: string;
  tags: string[];
  fields: Array<{
    key: string;
    label: string;
    value: string;
    type: string;
    required: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

@ApiTags('Templates do Quadro')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class BoardTemplatesController {
  constructor(
    private readonly listTemplates: ListProjectTemplatesUseCase,
    private readonly getTemplateById: GetProjectTemplateByIdUseCase,
    private readonly createTask: CreateTaskUseCase,
  ) {}

  @Get(['tasks/boards/:boardId/templates', 'tasks/projects/:boardId/templates'])
  @ApiOperation({ summary: 'Listar templates disponíveis para o quadro' })
  findBoardTemplates(
    @Param('boardId') boardId: string,
  ): BoardTemplateResponse[] {
    const templates = this.listTemplates.execute();
    return templates.map((t) => ({
      id: t.id,
      boardId,
      name: t.name,
      description: t.description,
      enabled: true,
      status: 'BACKLOG',
      priority: 'MEDIA',
      tags: [],
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  @Post([
    'tasks/boards/:boardId/templates',
    'tasks/projects/:boardId/templates',
  ])
  @ApiOperation({ summary: 'Criar template no quadro' })
  createBoardTemplate(
    @Param('boardId') boardId: string,
    @Body() dto: { name: string; description?: string },
  ): BoardTemplateResponse {
    return {
      id: `tmpl-${Date.now()}`,
      boardId,
      name: dto.name,
      description: dto.description || '',
      enabled: true,
      status: 'BACKLOG',
      priority: 'MEDIA',
      tags: [],
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch('tasks/templates/:templateId')
  @ApiOperation({ summary: 'Atualizar template do quadro' })
  updateBoardTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: Record<string, unknown>,
  ): Record<string, unknown> {
    return { id: templateId, ...dto, updatedAt: new Date().toISOString() };
  }

  @Delete('tasks/templates/:templateId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir template do quadro' })
  deleteBoardTemplate(): void {
    // No-op gracioso
  }

  @Patch([
    'tasks/boards/:boardId/templates/reorder',
    'tasks/projects/:boardId/templates/reorder',
  ])
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar templates do quadro' })
  reorderBoardTemplates(): void {
    // No-op gracioso
  }

  @Post('tasks/templates/:templateId/apply')
  @ApiOperation({ summary: 'Aplicar template criando uma tarefa no quadro' })
  async applyBoardTemplate(
    @Param('templateId') templateId: string,
    @Body()
    taskOverrides: {
      projetoId?: string;
      titulo?: string;
      descricao?: string;
      prioridade?: 'ALTA' | 'MEDIA' | 'BAIXA';
    },
  ): Promise<Task> {
    const template = this.getTemplateById.execute(templateId);
    return this.createTask.execute({
      projetoId: taskOverrides.projetoId || '',
      titulo: taskOverrides.titulo || `Tarefa de ${template.name}`,
      descricao: taskOverrides.descricao || template.description,
      prioridade: taskOverrides.prioridade || 'MEDIA',
    });
  }
}
