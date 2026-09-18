import { Inject, Injectable } from '@nestjs/common';
import type { Paginated } from '../../../core/common/pagination';
import type { LabOrderRow } from '../domain/lab-work-order';
import type { LabRepositoryPort } from './ports/lab-repository.port';
import { LAB_REPOSITORY_PORT } from './ports/lab-repository.port';

export interface ListLabOrdersOptions {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListLabOrdersUseCase {
  constructor(
    @Inject(LAB_REPOSITORY_PORT)
    private readonly lab: LabRepositoryPort,
  ) {}

  execute(filter: ListLabOrdersOptions = {}): Promise<Paginated<LabOrderRow>> {
    return this.lab.listLabOrders(filter);
  }
}
