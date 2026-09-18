import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';

@Injectable()
export class CustomerConfirmOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(
    orderId: string,
    confirmedBy: string,
    note?: string | null,
  ): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }
    if (
      order.operationalStatus === 'FECHADO' ||
      order.operationalStatus === 'CANCELADO'
    ) {
      throw new BadRequestException(
        'No es posible confirmar un pedido cerrado o cancelado.',
      );
    }
    if (order.operationalStatus === 'CONFIRMADO') {
      throw new BadRequestException(
        'El pedido ya está confirmado por el cliente.',
      );
    }

    await this.orders.createCustomerEvent({
      id: uuidv4(),
      orderId: order.id,
      type: 'CONFIRMACION',
      note,
      createdById: confirmedBy,
    });

    const updated = await this.orders.update(orderId, {
      customerConfirmedBy: confirmedBy,
      customerConfirmedAt: new Date(),
      customerConfirmationNote: note,
      operationalStatus: 'CONFIRMADO',
    });

    return updated;
  }
}
