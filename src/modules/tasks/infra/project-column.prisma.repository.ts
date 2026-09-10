import { Inject, Injectable } from '@nestjs/common';
import type { ProjectColumn } from '../domain/task';
import type {
  CreateProjectColumnData,
  ProjectColumnRepositoryPort,
  UpdateProjectColumnData,
} from '../application/ports/project-column-repository.port';

export const PRISMA_PROJECT_COLUMNS_TOKEN = 'PRISMA_PROJECT_COLUMNS_TOKEN';

interface ProjectColumnRow {
  id: string;
  projetoId: string;
  title: string;
  order: number;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProjectColumnCrud {
  projetoColumn: {
    findMany(args?: {
      where?: { projetoId?: string };
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<ProjectColumnRow[]>;
    findUnique(args: {
      where: { id: string };
      select: Record<string, true>;
    }): Promise<ProjectColumnRow | null>;
    count(args?: { where?: { projetoId?: string } }): Promise<number>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProjectColumnRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ProjectColumnRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
  $transaction?<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}

const COLUMN_SELECT = {
  id: true,
  projetoId: true,
  title: true,
  order: true,
  color: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaProjectColumnRepository implements ProjectColumnRepositoryPort {
  constructor(
    @Inject(PRISMA_PROJECT_COLUMNS_TOKEN)
    private readonly prisma: PrismaProjectColumnCrud,
  ) {}

  async findByProjectId(projetoId: string): Promise<ProjectColumn[]> {
    const rows = await this.prisma.projetoColumn.findMany({
      where: { projetoId },
      orderBy: { order: 'asc' },
      select: COLUMN_SELECT,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<ProjectColumn | null> {
    const row = await this.prisma.projetoColumn.findUnique({
      where: { id },
      select: COLUMN_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateProjectColumnData): Promise<ProjectColumn> {
    let order = data.order;
    if (order === undefined) {
      const count = await this.prisma.projetoColumn.count({
        where: { projetoId: data.projetoId },
      });
      order = count;
    }

    const row = await this.prisma.projetoColumn.create({
      data: {
        projetoId: data.projetoId,
        title: data.title.trim(),
        order,
        color: data.color ?? null,
      },
      select: COLUMN_SELECT,
    });
    return this.toDomain(row);
  }

  async update(
    id: string,
    data: UpdateProjectColumnData,
  ): Promise<ProjectColumn> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.order !== undefined) updateData.order = data.order;
    if (data.color !== undefined) updateData.color = data.color;

    const row = await this.prisma.projetoColumn.update({
      where: { id },
      data: updateData,
      select: COLUMN_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.projetoColumn.delete({ where: { id } });
  }

  async reorder(
    projetoId: string,
    columnIds: string[],
  ): Promise<ProjectColumn[]> {
    for (let i = 0; i < columnIds.length; i++) {
      await this.prisma.projetoColumn.update({
        where: { id: columnIds[i] },
        data: { order: i },
        select: COLUMN_SELECT,
      });
    }
    return this.findByProjectId(projetoId);
  }

  private toDomain(row: ProjectColumnRow): ProjectColumn {
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
