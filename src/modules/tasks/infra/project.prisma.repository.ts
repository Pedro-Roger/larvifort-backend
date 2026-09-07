import { Inject, Injectable } from '@nestjs/common';
import type { Project } from '../domain/task';
import type {
  CreateProjectData,
  ProjectRepositoryPort,
  UpdateProjectData,
} from '../application/ports/project-repository.port';

export const PRISMA_PROJECTS_TOKEN = 'PRISMA_PROJECTS_TOKEN';

interface ProjectRow {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProjectCrud {
  projeto: {
    findMany(args?: {
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<ProjectRow[]>;
    findUnique(args: {
      where: { id?: string; name?: string };
      select: Record<string, true>;
    }): Promise<ProjectRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProjectRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProjectRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const PROJECT_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryPort {
  constructor(
    @Inject(PRISMA_PROJECTS_TOKEN)
    private readonly prisma: PrismaProjectCrud,
  ) {}

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.projeto.findMany({
      orderBy: { name: 'asc' },
      select: PROJECT_SELECT,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.projeto.findUnique({
      where: { id },
      select: PROJECT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const row = await this.prisma.projeto.findUnique({
      where: { name: name.trim() },
      select: PROJECT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateProjectData): Promise<Project> {
    const row = await this.prisma.projeto.create({
      data: { name: data.name.trim() },
      select: PROJECT_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();

    const row = await this.prisma.projeto.update({
      where: { id },
      data: updateData,
      select: PROJECT_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.projeto.delete({ where: { id } });
  }

  private toDomain(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
