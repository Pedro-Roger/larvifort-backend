import { Inject, Injectable } from '@nestjs/common';
import { StockReservationListItem } from '../domain/stock-reservation';
import {
  ReservationFilter,
  STOCK_INVENTORY_REPOSITORY_PORT,
  StockInventoryRepositoryPort,
} from './ports/stock-inventory-repository.port';

@Injectable()
export class ListReservationsUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly repo: StockInventoryRepositoryPort,
  ) {}

  async execute(
    filter: ReservationFilter,
  ): Promise<StockReservationListItem[]> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(100, filter.limit ?? 20));
    return this.repo.listReservations({ ...filter, page, limit });
  }
}
