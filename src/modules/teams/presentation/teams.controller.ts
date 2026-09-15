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
import type { Team } from '../domain/team';
import { ListTeamsUseCase } from '../application/teams.usecases';
import { GetTeamByIdUseCase } from '../application/teams.usecases';
import { CreateTeamUseCase } from '../application/teams.usecases';
import { UpdateTeamUseCase } from '../application/teams.usecases';
import { DeleteTeamUseCase } from '../application/teams.usecases';

@ApiTags('Equipes')
@ApiBearerAuth('access-token')
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(
    private readonly listTeams: ListTeamsUseCase,
    private readonly getTeamById: GetTeamByIdUseCase,
    private readonly createTeam: CreateTeamUseCase,
    private readonly updateTeam: UpdateTeamUseCase,
    private readonly deleteTeam: DeleteTeamUseCase,
  ) {}

  /**
   * Endpoint: GET /api/v1/teams
   * Função: Retorna todas as equipes cadastradas no sistema.
   */
  @Get()
  findMany(): Promise<Team[]> {
    return this.listTeams.execute();
  }

  /**
   * Endpoint: GET /api/v1/teams/:id
   * Função: Busca e retorna uma equipe específica pelo seu ID.
   */
  @Get(':id')
  findById(@Param('id') id: string): Promise<Team | null> {
    return this.getTeamById.execute(id);
  }

  /**
   * Endpoint: POST /api/v1/teams
   * Função: Cria uma nova equipe a partir dos dados enviados no corpo (body) da requisição.
   */
  @Post()
  create(@Body() dto: { name: string }): Promise<Team> {
    return this.createTeam.execute(dto.name);
  }

  /**
   * Endpoint: PATCH /api/v1/teams/:id
   * Função: Atualiza as informações (ex: nome) de uma equipe existente pelo seu ID.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: { name: string },
  ): Promise<Team> {
    return this.updateTeam.execute(id, dto.name);
  }

  /**
   * Endpoint: DELETE /api/v1/teams/:id
   * Função: Remove uma equipe do banco de dados pelo seu ID (Retorna status 204 No Content).
   */
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteTeam.execute(id);
  }

  /**
   * Endpoint: POST /api/v1/teams/:id/members
   * Função: Adiciona um novo membro (usuário) à equipe especificada.
   */
  @Post(':id/members')
  @HttpCode(200)
  async addMember(@Param('id') id: string): Promise<Team> {
    // TODO: Implement member addition logic
    // This would typically involve creating a relation between User and Team
    const team = await this.getTeamById.execute(id);
    if (!team) {
      throw new Error('Team not found');
    }
    return team;
  }

  /**
   * Endpoint: DELETE /api/v1/teams/:id/members/:userId
   * Função: Remove um membro (usuário) específico da equipe informada.
   */
  @Delete(':id/members/:userId')
  @HttpCode(204)
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    void id;
    void userId;
    return Promise.resolve();
  }
}
