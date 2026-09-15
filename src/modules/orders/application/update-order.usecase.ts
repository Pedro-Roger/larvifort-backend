import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Order } from '../domain/order';
import type {
  OrderRepositoryPort,
  UpdateOrderInput,
} from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from '../../clients/application/ports/client-repository.port';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clientsRepo: ClientRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateOrderInput): Promise<Order> {
    const existing = await this.ordersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (existing.phase === 'CANCELLED') {
      throw new BadRequestException(
        'Não é possível editar um pedido cancelado.',
      );
    }

    if (input.clientId) {
      const client = await this.clientsRepo.findById(input.clientId);
      if (!client) {
        throw new NotFoundException('Cliente não encontrado.');
      }
    }

    if (input.items && input.items.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos 1 item.');
    }

    if (input.items) {
      for (let i = 0; i < input.items.length; i++) {
        const item = input.items[i];
        if (!item.productName?.trim()) {
          throw new BadRequestException(
            `Item ${i + 1}: nome do produto é obrigatório.`,
          );
        }
        if (item.quantity === undefined || item.quantity <= 0) {
          throw new BadRequestException(
            `Item ${i + 1}: quantidade deve ser maior que zero.`,
          );
        }
        if (item.unitPrice === undefined || item.unitPrice < 0) {
          throw new BadRequestException(
            `Item ${i + 1}: preço unitário deve ser maior ou igual a zero.`,
          );
        }
      }
    }

    return this.ordersRepo.update(id, input);
  }
}
