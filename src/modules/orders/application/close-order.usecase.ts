import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import {
  AUTOMATION_OUTBOX_PORT,
  type AutomationOutboxPort,
} from '../../automations/application/ports/automation-outbox.port';
import {
  AUTOMATION_REPOSITORY_PORT,
  type AutomationRepositoryPort,
} from '../../automations/application/ports/automation-repository.port';

function hasAddress(address?: Record<string, unknown> | null): boolean {
  if (!address) return false;
  return Object.values(address).some(
    (v) => v !== undefined && v !== null && v !== '',
  );
}

@Injectable()
export class CloseOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
    @Optional()
    @Inject(AUTOMATION_OUTBOX_PORT)
    private readonly outbox?: AutomationOutboxPort,
    @Optional()
    @Inject(AUTOMATION_REPOSITORY_PORT)
    private readonly automationsRepo?: AutomationRepositoryPort,
  ) {}

  async execute(id: string, closedBy: string): Promise<Order> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.operationalStatus === 'FECHADO') {
      throw new BadRequestException('El pedido ya está cerrado.');
    }
    if (order.operationalStatus === 'CANCELADO') {
      throw new BadRequestException('No se puede cerrar un pedido cancelado.');
    }

    const missing: string[] = [];
    if (!order.clientId) missing.push('cliente');
    if (!order.items || order.items.length === 0) missing.push('ítems');
    if (!hasAddress(order.shippingAddress))
      missing.push('dirección de entrega');
    if (!order.deliveryDate) missing.push('fecha de entrega');
    if (!order.paymentMethod) missing.push('forma de pago');

    if (missing.length > 0) {
      throw new BadRequestException(
        `No se puede cerrar el pedido: faltan datos obligatorios (${missing.join(', ')}).`,
      );
    }

    const closed = await this.orders.close(id, closedBy, new Date());

    // Dispara próximos pasos operacionales según automações configuradas (opt-in).
    if (this.outbox && this.automationsRepo) {
      try {
        const automations =
          await this.automationsRepo.findActiveByTrigger('ORDER_CLOSED');
        const projectIds = Array.from(
          new Set(automations.map((a) => a.projetoId)),
        );
        for (const projetoId of projectIds) {
          await this.outbox.publish({
            id: `evt-ord-closed-${closed.id}-${projetoId}-${Date.now()}`,
            type: 'ORDER_CLOSED',
            projetoId,
            aggregateId: closed.id,
            payload: {
              orderId: closed.id,
              orderNumber: closed.orderNumber,
              totalAmount: closed.totalAmount,
              clientId: closed.clientId,
              clientName: closed.clientName,
              closedBy,
              closedAt: new Date(),
            },
            depth: 0,
            causationChain: [],
            occurredAt: new Date(),
          });
        }
      } catch {
        // El fallo en el disparo no impide el cierre del pedido.
      }
    }

    return closed;
  }
}
