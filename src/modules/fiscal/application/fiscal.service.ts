import { Inject, Injectable } from '@nestjs/common';
import {
  FISCAL_REPOSITORY_PORT,
  FiscalRepositoryPort,
  UpdateFiscalInput,
} from './ports/fiscal-repository.port';

@Injectable()
export class FiscalService {
  constructor(
    @Inject(FISCAL_REPOSITORY_PORT)
    private readonly repo: FiscalRepositoryPort,
  ) {}

  async update(orderId: string, data: UpdateFiscalInput) {
    return this.repo.update(orderId, data);
  }

  async get(orderId: string) {
    return this.repo.get(orderId);
  }
}
