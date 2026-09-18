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
export class OrderCustomerChangeRequestUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(
    orderId: string,
    requestedBy: string,
    note: string,
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
        'No es posible solicitar cambios en un pedido cerrado o cancelado.',
      );
    }

    // Conserva el histórico de la solicitud de cambio.
    await this.orders.createCustomerEvent({
      id: uuidv4(),
      orderId: order.id,
      type: 'SOLICITUD_CAMBIO',
      note,
      createdById: requestedBy,
    });

    // Una solicitud de cambio invalida la confirmación previa.
    const nextStatus =
      order.operationalStatus === 'CONFIRMADO'
        ? 'AGUARDANDO_CONFIRMACION'
        : order.operationalStatus;

    const updatedOrder = await this.orders.update(orderId, {
      customerConfirmationNote: null,
      customerConfirmedBy: null,
      customerConfirmedAt: null,
      operationalStatus: nextStatus,
    });

    return updatedOrder;
  }
}
