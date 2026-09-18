import { Inject, Injectable } from '@nestjs/common';
import { StockLocation } from '../domain/stock-location';
import {
  FindStockLocationsFilter,
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from './ports/stock-repository.port';

@Injectable()
export class ListStockLocationsUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(filter: FindStockLocationsFilter): Promise<StockLocation[]> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(100, filter.limit ?? 20));
    return this.repo.listLocations({ ...filter, page, limit });
  }
}
