import { Inject, Injectable } from '@nestjs/common';
import type { Paginated } from '../../../core/common/pagination';
import type { Order } from '../domain/order';
import type {
  FindOrdersFilter,
  OrderRepositoryPort,
} from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(filter: FindOrdersFilter): Promise<Paginated<Order>> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));

    return this.ordersRepo.findMany({
      ...filter,
      page,
      limit,
    });
  }
}
