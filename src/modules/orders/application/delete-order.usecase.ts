import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.ordersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    await this.ordersRepo.delete(id);
  }
}
