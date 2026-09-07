import { Inject, Injectable } from '@nestjs/common';
import type { Prioridade, StatusTarefa, Task } from '../domain/task';
import type {
  CreateTaskData,
  FindTasksFilter,
  TaskRepositoryPort,
  UpdateTaskData,
} from '../application/ports/task-repository.port';

export const PRISMA_TASKS_TOKEN = 'PRISMA_TASKS_TOKEN';

interface TaskRow {
  id: string;
  projetoId: string;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  progresso: number;
  tags: string[];
  prazo: Date | null;
  estimativaH: number | null;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaTaskCrud {
  task: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<TaskRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id: string };
      select: Record<string, true>;
    }): Promise<TaskRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<TaskRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<TaskRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const TASK_SELECT = {
  id: true,
  projetoId: true,
  titulo: true,
  descricao: true,
  status: true,
  prioridade: true,
  progresso: true,
  tags: true,
  prazo: true,
  estimativaH: true,
  assigneeId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(
    @Inject(PRISMA_TASKS_TOKEN)
    private readonly prisma: PrismaTaskCrud,
  ) {}

  async findMany(
    filter: FindTasksFilter,
  ): Promise<{ data: Task[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.projetoId !== undefined) {
      where.projetoId = filter.projetoId;
    }
    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.assigneeId !== undefined) {
      where.assigneeId = filter.assigneeId;
    }
    if (filter.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { titulo: { contains: s, mode: 'insensitive' } },
        { descricao: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: TASK_SELECT,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({
      where: { id },
      select: TASK_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateTaskData): Promise<Task> {
    const tags = data.tags
      ? Array.from(new Set(data.tags.map((t) => t.trim()))).slice(0, 5)
      : [];

    const row = await this.prisma.task.create({
      data: {
        projetoId: data.projetoId,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() ?? null,
        status: data.status ?? 'BACKLOG',
        prioridade: data.prioridade ?? 'MEDIA',
        progresso: Math.max(0, Math.min(100, data.progresso ?? 0)),
        tags,
        prazo: data.prazo ?? null,
        estimativaH: data.estimativaH ?? null,
        assigneeId: data.assigneeId ?? null,
      },
      select: TASK_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const updateData: Record<string, unknown> = {};

    if (data.projetoId !== undefined) updateData.projetoId = data.projetoId;
    if (data.titulo !== undefined) updateData.titulo = data.titulo.trim();
    if (data.descricao !== undefined)
      updateData.descricao = data.descricao?.trim() ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.prioridade !== undefined) updateData.prioridade = data.prioridade;
    if (data.progresso !== undefined)
      updateData.progresso = Math.max(0, Math.min(100, data.progresso));
    if (data.tags !== undefined) {
      updateData.tags = Array.from(
        new Set(data.tags.map((t) => t.trim())),
      ).slice(0, 5);
    }
    if (data.prazo !== undefined) updateData.prazo = data.prazo;
    if (data.estimativaH !== undefined)
      updateData.estimativaH = data.estimativaH;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;

    const row = await this.prisma.task.update({
      where: { id },
      data: updateData,
      select: TASK_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  private toDomain(row: TaskRow): Task {
    return {
      id: row.id,
      projetoId: row.projetoId,
      titulo: row.titulo,
      descricao: row.descricao,
      status: row.status,
      prioridade: row.prioridade,
      progresso: row.progresso,
      tags: row.tags,
      prazo: row.prazo,
      estimativaH: row.estimativaH,
      assigneeId: row.assigneeId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
