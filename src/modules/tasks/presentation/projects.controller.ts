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
import type { Project, ProjectColumn } from '../domain/task';
import { ListProjectsUseCase } from '../application/list-projects.usecase';
import { GetProjectByIdUseCase } from '../application/get-project-by-id.usecase';
import { CreateProjectUseCase } from '../application/create-project.usecase';
import { UpdateProjectUseCase } from '../application/update-project.usecase';
import { DeleteProjectUseCase } from '../application/delete-project.usecase';
import { ListProjectColumnsUseCase } from '../application/list-project-columns.usecase';
import { CreateProjectColumnUseCase } from '../application/create-project-column.usecase';
import { UpdateProjectColumnUseCase } from '../application/update-project-column.usecase';
import { DeleteProjectColumnUseCase } from '../application/delete-project-column.usecase';
import { ReorderProjectColumnsUseCase } from '../application/reorder-project-columns.usecase';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectColumnDto } from './dto/create-project-column.dto';
import { UpdateProjectColumnDto } from './dto/update-project-column.dto';
import { ReorderProjectColumnsDto } from './dto/reorder-project-columns.dto';

// TASK 06 & FASE 5 — presentation de Projetos e Colunas persistidas.
// Suporta rotas /projects, /projetos e /tasks/projects.
@ApiTags('Projetos')
@ApiBearerAuth('access-token')
@Controller(['projects', 'projetos', 'tasks/projects'])
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly listProjects: ListProjectsUseCase,
    private readonly getProjectById: GetProjectByIdUseCase,
    private readonly createProject: CreateProjectUseCase,
    private readonly updateProject: UpdateProjectUseCase,
    private readonly deleteProject: DeleteProjectUseCase,
    private readonly listColumns: ListProjectColumnsUseCase,
    private readonly createColumn: CreateProjectColumnUseCase,
    private readonly updateColumn: UpdateProjectColumnUseCase,
    private readonly deleteColumn: DeleteProjectColumnUseCase,
    private readonly reorderColumns: ReorderProjectColumnsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos' })
  findAll(): Promise<Project[]> {
    return this.listProjects.execute();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes do projeto com colunas persistidas',
  })
  findById(@Param('id') id: string): Promise<Project> {
    return this.getProjectById.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo projeto com colunas atômicas' })
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.createProject.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do projeto' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.updateProject.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir projeto e suas colunas' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProject.execute(id);
  }

  @Get(':id/columns')
  @ApiOperation({ summary: 'Listar colunas persistidas de um projeto' })
  findColumns(@Param('id') id: string): Promise<ProjectColumn[]> {
    return this.listColumns.execute(id);
  }

  @Post(':id/columns')
  @ApiOperation({ summary: 'Criar coluna persistida em um projeto' })
  createProjectColumn(
    @Param('id') id: string,
    @Body() dto: CreateProjectColumnDto,
  ): Promise<ProjectColumn> {
    return this.createColumn.execute(id, dto);
  }

  @Patch(':id/columns/reorder')
  @ApiOperation({ summary: 'Reordenar colunas de um projeto' })
  reorderProjectColumns(
    @Param('id') id: string,
    @Body() dto: ReorderProjectColumnsDto,
  ): Promise<ProjectColumn[]> {
    return this.reorderColumns.execute(id, dto.columnIds);
  }

  @Patch(':id/columns/:columnId')
  @ApiOperation({ summary: 'Atualizar coluna persistida' })
  updateProjectColumn(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateProjectColumnDto,
  ): Promise<ProjectColumn> {
    return this.updateColumn.execute(columnId, dto);
  }

  @Delete(':id/columns/:columnId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir coluna persistida' })
  async deleteProjectColumn(
    @Param('columnId') columnId: string,
  ): Promise<void> {
    await this.deleteColumn.execute(columnId);
  }
}
