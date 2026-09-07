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
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Team } from '../domain/team';
import { ListTeamsUseCase } from '../application/teams.usecases';
import { GetTeamByIdUseCase } from '../application/teams.usecases';
import { CreateTeamUseCase } from '../application/teams.usecases';
import { UpdateTeamUseCase } from '../application/teams.usecases';
import { DeleteTeamUseCase } from '../application/teams.usecases';

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

  @Get()
  findMany(): Promise<Team[]> {
    return this.listTeams.execute();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Team | null> {
    return this.getTeamById.execute(id);
  }

  @Post()
  create(@Body() dto: { name: string }): Promise<Team> {
    return this.createTeam.execute(dto.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name: string }): Promise<Team> {
    return this.updateTeam.execute(id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteTeam.execute(id);
  }

  @Post(':id/members')
  @HttpCode(200)
  addMember(@Param('id') id: string): Promise<Team> {
    // TODO: Implement member addition logic
    // This would typically involve creating a relation between User and Team
    return this.getTeamById.execute(id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  removeMember(@Param('id') id: string, @Param('userId') userId: string): Promise<void> {
    // TODO: Implement member removal logic
    return;
  }
}