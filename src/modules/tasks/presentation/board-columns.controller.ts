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
import type { ProjectColumn } from '../domain/task';
import { ListProjectColumnsUseCase } from '../application/list-project-columns.usecase';
import { CreateProjectColumnUseCase } from '../application/create-project-column.usecase';
import { UpdateProjectColumnUseCase } from '../application/update-project-column.usecase';
import { DeleteProjectColumnUseCase } from '../application/delete-project-column.usecase';
import { ReorderProjectColumnsUseCase } from '../application/reorder-project-columns.usecase';
import { CreateProjectColumnDto } from './dto/create-project-column.dto';
import { UpdateProjectColumnDto } from './dto/update-project-column.dto';
import { ReorderProjectColumnsDto } from './dto/reorder-project-columns.dto';

@ApiTags('Colunas do Quadro')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class BoardColumnsController {
  constructor(
    private readonly listColumns: ListProjectColumnsUseCase,
    private readonly createColumn: CreateProjectColumnUseCase,
    private readonly updateColumn: UpdateProjectColumnUseCase,
    private readonly deleteColumn: DeleteProjectColumnUseCase,
    private readonly reorderColumns: ReorderProjectColumnsUseCase,
  ) {}

  @Get(['tasks/boards/:boardId/columns', 'tasks/projects/:boardId/columns'])
  @ApiOperation({ summary: 'Listar colunas de um quadro/board' })
  findBoardColumns(
    @Param('boardId') boardId: string,
  ): Promise<ProjectColumn[]> {
    return this.listColumns.execute(boardId);
  }

  @Post(['tasks/boards/:boardId/columns', 'tasks/projects/:boardId/columns'])
  @ApiOperation({ summary: 'Criar coluna em um quadro/board' })
  createBoardColumn(
    @Param('boardId') boardId: string,
    @Body() dto: CreateProjectColumnDto,
  ): Promise<ProjectColumn> {
    return this.createColumn.execute(boardId, dto);
  }

  @Patch([
    'tasks/boards/:boardId/columns/reorder',
    'tasks/projects/:boardId/columns/reorder',
  ])
  @ApiOperation({ summary: 'Reordenar colunas de um quadro/board' })
  reorderBoardColumns(
    @Param('boardId') boardId: string,
    @Body()
    dto: ReorderProjectColumnsDto & {
      columnOrders?: { id: string; order: number }[];
    },
  ): Promise<ProjectColumn[]> {
    const ids =
      dto.columnIds && dto.columnIds.length > 0
        ? dto.columnIds
        : dto.columnOrders
            ?.slice()
            .sort((a, b) => a.order - b.order)
            .map((c) => c.id) || [];
    return this.reorderColumns.execute(boardId, ids);
  }

  @Patch('tasks/columns/:columnId')
  @ApiOperation({ summary: 'Atualizar coluna diretamente por ID' })
  updateDirectColumn(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateProjectColumnDto,
  ): Promise<ProjectColumn> {
    return this.updateColumn.execute(columnId, dto);
  }

  @Delete('tasks/columns/:columnId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir coluna diretamente por ID' })
  async deleteDirectColumn(@Param('columnId') columnId: string): Promise<void> {
    await this.deleteColumn.execute(columnId);
  }
}
