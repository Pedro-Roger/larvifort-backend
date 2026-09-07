import { Inject, Injectable } from '@nestjs/common';
import type {
  CommercialGroup,
  Company,
  StatusEmpresa,
} from '../domain/company';
import type {
  CommercialGroupRepositoryPort,
  CreateCommercialGroupData,
  UpdateCommercialGroupData,
} from '../application/ports/commercial-group-repository.port';

export const PRISMA_COMMERCIAL_GROUPS_TOKEN = 'PRISMA_COMMERCIAL_GROUPS_TOKEN';

interface CommercialGroupRow {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyRow {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  status: StatusEmpresa;
  grupoId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaCommercialGroupCrud {
  grupoComercial: {
    findMany(args?: {
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<CommercialGroupRow[]>;
    findUnique(args: {
      where: { id?: string; name?: string };
      select: Record<string, true>;
    }): Promise<CommercialGroupRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<CommercialGroupRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<CommercialGroupRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
  empresa: {
    findMany(args: {
      where: { grupoId: string };
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<CompanyRow[]>;
  };
}

const GROUP_SELECT = {
  id: true,
  name: true,
  color: true,
  createdAt: true,
  updatedAt: true,
} as const;

const COMPANY_SELECT = {
  id: true,
  name: true,
  cnpj: true,
  city: true,
  status: true,
  grupoId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaCommercialGroupRepository implements CommercialGroupRepositoryPort {
  constructor(
    @Inject(PRISMA_COMMERCIAL_GROUPS_TOKEN)
    private readonly prisma: PrismaCommercialGroupCrud,
  ) {}

  async findAll(): Promise<CommercialGroup[]> {
    const rows = await this.prisma.grupoComercial.findMany({
      orderBy: { name: 'asc' },
      select: GROUP_SELECT,
    });
    return rows.map((r) => this.toGroupDomain(r));
  }

  async findById(id: string): Promise<CommercialGroup | null> {
    const row = await this.prisma.grupoComercial.findUnique({
      where: { id },
      select: GROUP_SELECT,
    });
    return row ? this.toGroupDomain(row) : null;
  }

  async findByName(name: string): Promise<CommercialGroup | null> {
    const row = await this.prisma.grupoComercial.findUnique({
      where: { name: name.trim() },
      select: GROUP_SELECT,
    });
    return row ? this.toGroupDomain(row) : null;
  }

  async create(data: CreateCommercialGroupData): Promise<CommercialGroup> {
    const row = await this.prisma.grupoComercial.create({
      data: {
        name: data.name.trim(),
        color: data.color?.trim() || '#0ea5e9',
      },
      select: GROUP_SELECT,
    });
    return this.toGroupDomain(row);
  }

  async update(
    id: string,
    data: UpdateCommercialGroupData,
  ): Promise<CommercialGroup> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.color !== undefined) updateData.color = data.color.trim();

    const row = await this.prisma.grupoComercial.update({
      where: { id },
      data: updateData,
      select: GROUP_SELECT,
    });
    return this.toGroupDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.grupoComercial.delete({ where: { id } });
  }

  async findCompaniesByGroupId(groupId: string): Promise<Company[]> {
    const rows = await this.prisma.empresa.findMany({
      where: { grupoId: groupId },
      orderBy: { name: 'asc' },
      select: COMPANY_SELECT,
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      cnpj: r.cnpj,
      city: r.city,
      status: r.status,
      grupoId: r.grupoId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  private toGroupDomain(row: CommercialGroupRow): CommercialGroup {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
