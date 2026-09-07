import { Inject, Injectable } from '@nestjs/common';
import type { Client, StatusLead } from '../domain/client';
import type {
  ClientRepositoryPort,
  CreateClientData,
  FindClientsFilter,
  UpdateClientData,
} from '../application/ports/client-repository.port';

export const PRISMA_CLIENTS_TOKEN = 'PRISMA_CLIENTS_TOKEN';

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthdate: Date | null;
  cpfCnpj: string | null;
  statusLead: StatusLead;
  origem: string | null;
  pais: string | null;
  cidade: string | null;
  uf: string | null;
  endereco: string | null;
  observacoes: string | null;
  empresaId: string | null;
  laminaAgua: number | null;
  qtdViveiros: number | null;
  densidade: number | null;
  producaoMedia: number | null;
  temBercario: boolean;
  qtdBercarios: number | null;
  volumeBercarios: number | null;
  alimentadorAutomatico: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaClientCrud {
  cliente: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, true>;
    }): Promise<ClientRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id?: string; cpfCnpj?: string };
      select: Record<string, true>;
    }): Promise<ClientRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ClientRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, true>;
    }): Promise<ClientRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

const CLIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  birthdate: true,
  cpfCnpj: true,
  statusLead: true,
  origem: true,
  pais: true,
  cidade: true,
  uf: true,
  endereco: true,
  observacoes: true,
  empresaId: true,
  laminaAgua: true,
  qtdViveiros: true,
  densidade: true,
  producaoMedia: true,
  temBercario: true,
  qtdBercarios: true,
  volumeBercarios: true,
  alimentadorAutomatico: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaClientRepository implements ClientRepositoryPort {
  constructor(
    @Inject(PRISMA_CLIENTS_TOKEN)
    private readonly prisma: PrismaClientCrud,
  ) {}

  async findMany(
    filter: FindClientsFilter,
  ): Promise<{ data: Client[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.status !== undefined) {
      where.statusLead = filter.status;
    }
    if (filter.empresaId !== undefined) {
      where.empresaId = filter.empresaId;
    }
    if (filter.cidade?.trim()) {
      where.cidade = { contains: filter.cidade.trim(), mode: 'insensitive' };
    }
    if (filter.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { cpfCnpj: { contains: s, mode: 'insensitive' } },
        { cidade: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: CLIENT_SELECT,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Client | null> {
    const row = await this.prisma.cliente.findUnique({
      where: { id },
      select: CLIENT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Client | null> {
    const row = await this.prisma.cliente.findUnique({
      where: { cpfCnpj: cpfCnpj.trim() },
      select: CLIENT_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateClientData): Promise<Client> {
    const row = await this.prisma.cliente.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.trim().toLowerCase() ?? null,
        phone: data.phone?.trim() ?? null,
        birthdate: data.birthdate ?? null,
        cpfCnpj: data.cpfCnpj?.trim() ?? null,
        statusLead: data.statusLead ?? 'NOVO',
        origem: data.origem ?? null,
        pais: data.pais ?? 'Brasil',
        cidade: data.cidade?.trim() ?? null,
        uf: data.uf?.trim() ?? null,
        endereco: data.endereco?.trim() ?? null,
        observacoes: data.observacoes ?? null,
        empresaId: data.empresaId ?? null,
        laminaAgua: data.laminaAgua ?? null,
        qtdViveiros: data.qtdViveiros ?? null,
        densidade: data.densidade ?? null,
        producaoMedia: data.producaoMedia ?? null,
        temBercario: data.temBercario ?? false,
        qtdBercarios: data.temBercario ? (data.qtdBercarios ?? null) : null,
        volumeBercarios: data.temBercario
          ? (data.volumeBercarios ?? null)
          : null,
        alimentadorAutomatico: data.alimentadorAutomatico ?? false,
      },
      select: CLIENT_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined)
      updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.email !== undefined)
      updateData.email = data.email?.trim().toLowerCase() ?? null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() ?? null;
    if (data.birthdate !== undefined) updateData.birthdate = data.birthdate;
    if (data.cpfCnpj !== undefined)
      updateData.cpfCnpj = data.cpfCnpj?.trim() ?? null;
    if (data.statusLead !== undefined) updateData.statusLead = data.statusLead;
    if (data.origem !== undefined) updateData.origem = data.origem;
    if (data.pais !== undefined) updateData.pais = data.pais;
    if (data.cidade !== undefined)
      updateData.cidade = data.cidade?.trim() ?? null;
    if (data.uf !== undefined) updateData.uf = data.uf?.trim() ?? null;
    if (data.endereco !== undefined)
      updateData.endereco = data.endereco?.trim() ?? null;
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;
    if (data.empresaId !== undefined) updateData.empresaId = data.empresaId;
    if (data.laminaAgua !== undefined) updateData.laminaAgua = data.laminaAgua;
    if (data.qtdViveiros !== undefined)
      updateData.qtdViveiros = data.qtdViveiros;
    if (data.densidade !== undefined) updateData.densidade = data.densidade;
    if (data.producaoMedia !== undefined)
      updateData.producaoMedia = data.producaoMedia;
    if (data.temBercario !== undefined) {
      updateData.temBercario = data.temBercario;
      if (!data.temBercario) {
        updateData.qtdBercarios = null;
        updateData.volumeBercarios = null;
      }
    }
    if (data.qtdBercarios !== undefined && data.temBercario !== false) {
      updateData.qtdBercarios = data.qtdBercarios;
    }
    if (data.volumeBercarios !== undefined && data.temBercario !== false) {
      updateData.volumeBercarios = data.volumeBercarios;
    }
    if (data.alimentadorAutomatico !== undefined)
      updateData.alimentadorAutomatico = data.alimentadorAutomatico;

    const row = await this.prisma.cliente.update({
      where: { id },
      data: updateData,
      select: CLIENT_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cliente.delete({ where: { id } });
  }

  private toDomain(row: ClientRow): Client {
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      birthdate: row.birthdate,
      cpfCnpj: row.cpfCnpj,
      statusLead: row.statusLead,
      origem: row.origem,
      pais: row.pais,
      cidade: row.cidade,
      uf: row.uf,
      endereco: row.endereco,
      observacoes: row.observacoes,
      empresaId: row.empresaId,
      laminaAgua: row.laminaAgua,
      qtdViveiros: row.qtdViveiros,
      densidade: row.densidade,
      producaoMedia: row.producaoMedia,
      temBercario: row.temBercario,
      qtdBercarios: row.qtdBercarios,
      volumeBercarios: row.volumeBercarios,
      alimentadorAutomatico: row.alimentadorAutomatico,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
