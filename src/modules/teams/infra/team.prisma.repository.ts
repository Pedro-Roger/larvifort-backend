import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import type { Team } from '../domain/team';
import type { TeamRepositoryPort } from '../application/ports/team-repository.port';

export const PRISMA_TEAMS_TOKEN = 'PRISMA_TEAMS_TOKEN';

@Injectable()
export class PrismaTeamRepository implements TeamRepositoryPort {
  constructor(
    @Inject(PRISMA_TEAMS_TOKEN)
    private readonly prisma: PrismaService,
  ) {}

  async findMany(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      orderBy: { name: 'asc' },
    });
    return teams.map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async findById(id: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) return null;
    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  async findByName(name: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { name },
    });
    if (!team) return null;
    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  async create(name: string): Promise<Team> {
    const team = await this.prisma.team.create({
      data: { name },
    });
    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  async update(id: string, name: string): Promise<Team> {
    const team = await this.prisma.team.update({
      where: { id },
      data: { name },
    });
    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.team.delete({
      where: { id },
    });
  }
}