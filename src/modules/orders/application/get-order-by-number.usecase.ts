import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class GetOrderByNumberUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(orderNumber: string): Promise<Order> {
    const order = await this.ordersRepo.findByOrderNumber(orderNumber.trim());
    if (!order) {
      throw new NotFoundException(`Pedido número "${orderNumber}" não encontrado.`);
    }
    return order;
  }
}
