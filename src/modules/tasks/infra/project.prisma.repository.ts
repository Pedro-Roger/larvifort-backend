import { Inject, Injectable } from '@nestjs/common';
import type { Project, ProjectColumn } from '../domain/task';
import type {
  CreateProjectData,
  ProjectRepositoryPort,
  UpdateProjectData,
} from '../application/ports/project-repository.port';

export const PRISMA_PROJECTS_TOKEN = 'PRISMA_PROJECTS_TOKEN';

const DEFAULT_COLUMNS = ['Backlog', 'Em Andamento', 'Em Revisão', 'Concluído'];

interface ProjectColumnRow {
  id: string;
  projetoId: string;
  title: string;
  order: number;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectRow {
  id: string;
  name: string;
  columns?: ProjectColumnRow[];
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProjectCrud {
  projeto: {
    findMany(args?: {
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, unknown>;
    }): Promise<ProjectRow[]>;
    findUnique(args: {
      where: { id?: string; name?: string };
      select: Record<string, unknown>;
    }): Promise<ProjectRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<ProjectRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<ProjectRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const PROJECT_SELECT = {
  id: true,
  name: true,
  columns: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      projetoId: true,
      title: true,
      order: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    },
  },
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
    let columnsToCreate: {
      title: string;
      color: string | null;
      order: number;
    }[];

    if (data.columns && data.columns.length > 0) {
      columnsToCreate = data.columns.map((col, index) => ({
        title: col.name.trim(),
        color: col.color ?? null,
        order: col.order !== undefined ? col.order : index,
      }));
    } else if (data.initialColumns && data.initialColumns.length > 0) {
      columnsToCreate = data.initialColumns.map((title, index) => ({
        title: title.trim(),
        color: null,
        order: index,
      }));
    } else {
      columnsToCreate = DEFAULT_COLUMNS.map((title, index) => ({
        title,
        color: null,
        order: index,
      }));
    }

    const row = await this.prisma.projeto.create({
      data: {
        name: data.name.trim(),
        columns: {
          create: columnsToCreate,
        },
      },
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
      columns: row.columns
        ? row.columns.map((c) => this.toColumnDomain(c))
        : [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toColumnDomain(row: ProjectColumnRow): ProjectColumn {
    return {
      id: row.id,
      projetoId: row.projetoId,
      title: row.title,
      order: row.order,
      color: row.color,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
