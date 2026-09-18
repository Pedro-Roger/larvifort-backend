import { Inject, Injectable } from '@nestjs/common';
import {
  FiscalRepositoryPort,
  UpdateFiscalInput,
} from '../application/ports/fiscal-repository.port';
import { FiscalStatus } from '../domain/fiscal';

export const PRISMA_FISCAL_TOKEN = 'PRISMA_FISCAL_TOKEN';

interface FiscalOrderRow {
  fiscalStatus: FiscalStatus;
  fiscalData: unknown;
  fiscalNotes: string | null;
}

interface PrismaFiscalCrud {
  order: {
    update(args: {
      where: { id: string };
      data: {
        fiscalStatus?: FiscalStatus;
        fiscalData?: Record<string, any>;
        fiscalNotes?: string | null;
      };
    }): Promise<unknown>;
    findUnique(args: {
      where: { id: string };
      select: {
        fiscalStatus: true;
        fiscalData: true;
        fiscalNotes: true;
      };
    }): Promise<FiscalOrderRow | null>;
  };
}

@Injectable()
export class PrismaFiscalRepository implements FiscalRepositoryPort {
  constructor(
    @Inject(PRISMA_FISCAL_TOKEN)
    private readonly prisma: PrismaFiscalCrud,
  ) {}

  async update(orderId: string, data: UpdateFiscalInput): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        fiscalStatus: data.status,
        fiscalData: data.data,
        fiscalNotes: data.notes,
      },
    });
  }

  async get(
    orderId: string,
  ): Promise<{ status: FiscalStatus; data: any; notes: string | null }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { fiscalStatus: true, fiscalData: true, fiscalNotes: true },
    });

    if (!order) throw new Error('Order not found');

    return {
      status: order.fiscalStatus,
      data: order.fiscalData,
      notes: order.fiscalNotes,
    };
  }
}
