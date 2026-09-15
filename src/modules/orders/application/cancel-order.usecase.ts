import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
  ) {}

  async execute(id: string, reason: string): Promise<Order> {
    if (!reason?.trim()) {
      throw new BadRequestException('Motivo de cancelamento é obrigatório.');
    }

    const existing = await this.ordersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (existing.phase === 'CANCELLED') {
      throw new BadRequestException('Pedido já se encontra cancelado.');
    }

    const cancelledAt = new Date();
    return this.ordersRepo.cancel(id, reason.trim(), cancelledAt);
  }
}
