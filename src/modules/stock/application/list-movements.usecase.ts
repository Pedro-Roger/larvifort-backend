import { Injectable } from '@nestjs/common';
import { StockMovement } from '../domain/stock-movement';
import {
  FindMovementsFilter,
  STOCK_INVENTORY_REPOSITORY_PORT,
  StockInventoryRepositoryPort,
} from './ports/stock-inventory-repository.port';
import { Inject } from '@nestjs/common';

@Injectable()
export class ListMovementsUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly repo: StockInventoryRepositoryPort,
  ) {}

  async execute(filter: FindMovementsFilter): Promise<StockMovement[]> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(100, filter.limit ?? 20));
    return this.repo.listMovements({ ...filter, page, limit });
  }
}
