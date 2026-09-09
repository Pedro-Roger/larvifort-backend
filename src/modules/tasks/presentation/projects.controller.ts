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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Project } from '../domain/task';
import { ListProjectsUseCase } from '../application/list-projects.usecase';
import { GetProjectByIdUseCase } from '../application/get-project-by-id.usecase';
import { CreateProjectUseCase } from '../application/create-project.usecase';
import { UpdateProjectUseCase } from '../application/update-project.usecase';
import { DeleteProjectUseCase } from '../application/delete-project.usecase';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// TASK 06 — presentation de Projetos.
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
  ) {}

  @Get()
  findAll(): Promise<Project[]> {
    return this.listProjects.execute();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Project> {
    return this.getProjectById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.createProject.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.updateProject.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProject.execute(id);
  }
}
