import { Inject, Injectable } from '@nestjs/common';
import type { Company, StatusEmpresa } from '../domain/company';
import type {
  CompanyRepositoryPort,
  CreateCompanyData,
  FindCompaniesFilter,
  UpdateCompanyData,
} from '../application/ports/company-repository.port';

export const PRISMA_COMPANIES_TOKEN = 'PRISMA_COMPANIES_TOKEN';

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

interface PrismaCompanyCrud {
  empresa: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<CompanyRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id?: string; cnpj?: string };
      select: Record<string, true>;
    }): Promise<CompanyRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<CompanyRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<CompanyRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

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
export class PrismaCompanyRepository implements CompanyRepositoryPort {
  constructor(
    @Inject(PRISMA_COMPANIES_TOKEN)
    private readonly prisma: PrismaCompanyCrud,
  ) {}

  async findMany(
    filter: FindCompaniesFilter,
  ): Promise<{ data: Company[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.grupoId !== undefined) {
      where.grupoId = filter.grupoId;
    }
    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { cnpj: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.empresa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: COMPANY_SELECT,
      }),
      this.prisma.empresa.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Company | null> {
    const row = await this.prisma.empresa.findUnique({
      where: { id },
      select: COMPANY_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const row = await this.prisma.empresa.findUnique({
      where: { cnpj: cnpj.trim() },
      select: COMPANY_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateCompanyData): Promise<Company> {
    const row = await this.prisma.empresa.create({
      data: {
        name: data.name.trim(),
        cnpj: data.cnpj?.trim() ?? null,
        city: data.city?.trim() ?? null,
        status: data.status ?? 'PROSPECT',
        grupoId: data.grupoId ?? null,
      },
      select: COMPANY_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj?.trim() ?? null;
    if (data.city !== undefined) updateData.city = data.city?.trim() ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.grupoId !== undefined) updateData.grupoId = data.grupoId;

    const row = await this.prisma.empresa.update({
      where: { id },
      data: updateData,
      select: COMPANY_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.empresa.delete({ where: { id } });
  }

  private toDomain(row: CompanyRow): Company {
    return {
      id: row.id,
      name: row.name,
      cnpj: row.cnpj,
      city: row.city,
      status: row.status,
      grupoId: row.grupoId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
