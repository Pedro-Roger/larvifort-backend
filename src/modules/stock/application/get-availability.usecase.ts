import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityRow } from '../domain/availability';
import {
  AvailabilityFilter,
  STOCK_INVENTORY_REPOSITORY_PORT,
  StockInventoryRepositoryPort,
} from './ports/stock-inventory-repository.port';

@Injectable()
export class GetAvailabilityUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly repo: StockInventoryRepositoryPort,
  ) {}

  async execute(filter: AvailabilityFilter): Promise<AvailabilityRow[]> {
    return this.repo.getAvailability(filter);
  }
}
