import { Inject, Injectable } from '@nestjs/common';
import type { TeamRepositoryPort } from './ports/team-repository.port';
import { TEAM_REPOSITORY_PORT } from './ports/team-repository.port';

@Injectable()
export class ListTeamsUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  async execute(): Promise<Team[]> {
    return this.teams.findMany();
  }
}

@Injectable()
@Injectable()
export class GetTeamByIdUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  async execute(id: string): Promise<Team | null> {
    return this.teams.findById(id);
  }
}

@Injectable()
@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  async execute(name: string): Promise<Team> {
    return this.teams.create(name);
  }
}

@Injectable()
@Injectable()
export class UpdateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  async execute(id: string, name: string): Promise<Team> {
    return this.teams.update(id, name);
  }
}

@Injectable()
@Injectable()
export class DeleteTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    await this.teams.delete(id);
  }
}