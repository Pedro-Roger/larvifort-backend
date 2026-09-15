import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(id: string): Promise<Order> {
    const order = await this.ordersRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    return order;
  }
}
