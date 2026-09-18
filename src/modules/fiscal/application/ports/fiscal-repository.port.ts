import { FiscalStatus } from '../../domain/fiscal';

export const FISCAL_REPOSITORY_PORT = 'FISCAL_REPOSITORY_PORT';

export interface UpdateFiscalInput {
  status?: FiscalStatus;
  data?: Record<string, any>;
  notes?: string | null;
}

export interface FiscalRepositoryPort {
  update(orderId: string, data: UpdateFiscalInput): Promise<void>;
  get(
    orderId: string,
  ): Promise<{ status: FiscalStatus; data: any; notes: string | null }>;
}
