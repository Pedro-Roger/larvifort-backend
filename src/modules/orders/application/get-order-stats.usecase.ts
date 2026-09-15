import { Inject, Injectable } from '@nestjs/common';
import type { OrderStats } from '../domain/order';
import type {
  FindOrdersFilter,
  OrderRepositoryPort,
} from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class GetOrderStatsUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(filter?: Partial<FindOrdersFilter>): Promise<OrderStats> {
    return this.ordersRepo.getStats(filter);
  }
}
