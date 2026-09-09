import { Inject, Injectable } from '@nestjs/common';
import type { FieldSearch, Uniformidade } from '../domain/field-search';
import type {
  FieldSearchRepositoryPort,
  CreateFieldSearchData,
  FindPesquisasFilter,
  UpdateFieldSearchData,
} from '../application/ports/field-repository.port';

export const PRISMA_FIELD_SEARCH_TOKEN = 'PRISMA_FIELD_SEARCH_TOKEN';

interface FieldSearchRow {
  id: string;
  clienteId: string;
  cliente?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    cidade?: string | null;
  } | null;
  dataPesquisa: Date;
  responsavelId?: string | null;
  responsavel?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  larvas: string[];
  maioriaLarvifort: boolean;
  parouLarvifort: boolean;
  motivosSaida: string[];
  outroMotivo?: string | null;
  uniformidadeBercario?: Uniformidade | null;
  uniformidadeCultivo?: Uniformidade | null;
  sobrevBercario?: number | null;
  sobrevCultivo?: number | null;
  resultadosUltimoCiclo?: string | null;
  observacoes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaFieldSearchCrud {
  fieldSearch: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, unknown>;
    }): Promise<FieldSearchRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id?: string };
      select: Record<string, unknown>;
    }): Promise<FieldSearchRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<FieldSearchRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<FieldSearchRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const FIELD_SEARCH_SELECT = {
  id: true,
  clienteId: true,
  cliente: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      cidade: true,
    },
  },
  dataPesquisa: true,
  responsavelId: true,
  responsavel: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  larvas: true,
  maioriaLarvifort: true,
  parouLarvifort: true,
  motivosSaida: true,
  outroMotivo: true,
  uniformidadeBercario: true,
  uniformidadeCultivo: true,
  sobrevBercario: true,
  sobrevCultivo: true,
  resultadosUltimoCiclo: true,
  observacoes: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaFieldSearchRepository implements FieldSearchRepositoryPort {
  constructor(
    @Inject(PRISMA_FIELD_SEARCH_TOKEN)
    private readonly prisma: PrismaFieldSearchCrud,
  ) {}

  async findMany(
    filter: FindPesquisasFilter,
  ): Promise<{ data: FieldSearch[]; total: number }> {
    const where: Record<string, unknown> = {};

    const clienteId = filter.clienteId || filter.cliente;
    if (clienteId !== undefined) {
      where.clienteId = clienteId;
    }
    if (filter.somenteLarvifort !== undefined) {
      where.maioriaLarvifort = filter.somenteLarvifort;
    }
    if (filter.de !== undefined) {
      where.dataPesquisa = { gte: filter.de };
    }
    if (filter.ate !== undefined) {
      if (where.dataPesquisa && typeof where.dataPesquisa === 'object') {
        where.dataPesquisa = {
          ...where.dataPesquisa,
          lte: filter.ate,
        };
      } else {
        where.dataPesquisa = { lte: filter.ate };
      }
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.fieldSearch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataPesquisa: 'desc' },
        select: FIELD_SEARCH_SELECT,
      }),
      this.prisma.fieldSearch.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<FieldSearch | null> {
    const row = await this.prisma.fieldSearch.findUnique({
      where: { id },
      select: FIELD_SEARCH_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateFieldSearchData): Promise<FieldSearch> {
    const row = await this.prisma.fieldSearch.create({
      data: {
        clienteId: data.clienteId,
        dataPesquisa: data.dataPesquisa,
        responsavelId: data.responsavelId,
        larvas: data.larvas,
        maioriaLarvifort: data.maioriaLarvifort,
        parouLarvifort: data.parouLarvifort,
        motivosSaida: data.motivosSaida,
        outroMotivo: data.outroMotivo,
        uniformidadeBercario: data.uniformidadeBercario,
        uniformidadeCultivo: data.uniformidadeCultivo,
        sobrevBercario: data.sobrevBercario,
        sobrevCultivo: data.sobrevCultivo,
        resultadosUltimoCiclo: data.resultadosUltimoCiclo,
        observacoes: data.observacoes,
      },
      select: FIELD_SEARCH_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateFieldSearchData): Promise<FieldSearch> {
    const updateData: Record<string, unknown> = {};

    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.dataPesquisa !== undefined && data.dataPesquisa !== null)
      updateData.dataPesquisa = data.dataPesquisa;
    if (data.responsavelId !== undefined)
      updateData.responsavelId = data.responsavelId;
    if (data.larvas !== undefined) updateData.larvas = data.larvas;
    if (data.maioriaLarvifort !== undefined)
      updateData.maioriaLarvifort = data.maioriaLarvifort;
    if (data.parouLarvifort !== undefined)
      updateData.parouLarvifort = data.parouLarvifort;
    if (data.motivosSaida !== undefined)
      updateData.motivosSaida = data.motivosSaida;
    if (data.outroMotivo !== undefined)
      updateData.outroMotivo = data.outroMotivo;
    if (data.uniformidadeBercario !== undefined)
      updateData.uniformidadeBercario = data.uniformidadeBercario;
    if (data.uniformidadeCultivo !== undefined)
      updateData.uniformidadeCultivo = data.uniformidadeCultivo;
    if (data.sobrevBercario !== undefined)
      updateData.sobrevBercario = data.sobrevBercario;
    if (data.sobrevCultivo !== undefined)
      updateData.sobrevCultivo = data.sobrevCultivo;
    if (data.resultadosUltimoCiclo !== undefined)
      updateData.resultadosUltimoCiclo = data.resultadosUltimoCiclo;
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;

    const row = await this.prisma.fieldSearch.update({
      where: { id },
      data: updateData,
      select: FIELD_SEARCH_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fieldSearch.delete({ where: { id } });
  }

  private toDomain(row: FieldSearchRow): FieldSearch {
    return {
      id: row.id,
      clienteId: row.clienteId,
      cliente: row.cliente
        ? {
            id: row.cliente.id,
            firstName: row.cliente.firstName,
            lastName: row.cliente.lastName,
            email: row.cliente.email,
            phone: row.cliente.phone,
            cidade: row.cliente.cidade,
          }
        : null,
      dataPesquisa: row.dataPesquisa,
      responsavelId: row.responsavelId,
      responsavel: row.responsavel
        ? {
            id: row.responsavel.id,
            firstName: row.responsavel.firstName,
            lastName: row.responsavel.lastName,
            email: row.responsavel.email,
          }
        : null,
      larvas: row.larvas,
      maioriaLarvifort: row.maioriaLarvifort,
      parouLarvifort: row.parouLarvifort,
      motivosSaida: row.motivosSaida,
      outroMotivo: row.outroMotivo,
      uniformidadeBercario: row.uniformidadeBercario,
      uniformidadeCultivo: row.uniformidadeCultivo,
      sobrevBercario: row.sobrevBercario,
      sobrevCultivo: row.sobrevCultivo,
      resultadosUltimoCiclo: row.resultadosUltimoCiclo,
      observacoes: row.observacoes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
