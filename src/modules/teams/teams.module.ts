import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TeamsController } from './presentation/teams.controller';
import { ListTeamsUseCase } from './application/teams.usecases';
import { GetTeamByIdUseCase } from '../application/teams.usecases';
import { CreateTeamUseCase } from '../application/teams.usecases';
import { UpdateTeamUseCase } from '../application/teams.usecases';
import { DeleteTeamUseCase } from '../application/teams.usecases';
import { PrismaTeamRepository } from './infra/team.prisma.repository';
import { TEAM_REPOSITORY_PORT } from './application/ports/team-repository.port';

@Module({
  controllers: [TeamsController],
  providers: [
    ListTeamsUseCase,
    GetTeamByIdUseCase,
    CreateTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
    PrismaTeamRepository,
    {
      provide: TEAM_REPOSITORY_PORT,
      useClass: PrismaTeamRepository,
    },
  ],
  exports: [
    TEAM_REPOSITORY_PORT,
    ListTeamsUseCase,
    GetTeamByIdUseCase,
    CreateTeamUseCase,
    UpdateTeamUseCase,
    DeleteTeamUseCase,
  ],
})
export class TeamsModule {}