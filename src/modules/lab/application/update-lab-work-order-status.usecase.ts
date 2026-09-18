import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { OrderRepositoryPort } from '../../orders/application/ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../orders/application/ports/order-repository.port';
import {
  LAB_WORK_ORDER_STATUSES,
  type LabWorkOrder,
  type LabWorkOrderStatus,
} from '../domain/lab-work-order';
import type { LabRepositoryPort } from './ports/lab-repository.port';
import { LAB_REPOSITORY_PORT } from './ports/lab-repository.port';

@Injectable()
export class UpdateLabWorkOrderStatusUseCase {
  constructor(
    @Inject(LAB_REPOSITORY_PORT)
    private readonly lab: LabRepositoryPort,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(
    id: string,
    status: LabWorkOrderStatus,
    changedById: string,
  ): Promise<LabWorkOrder> {
    if (!LAB_WORK_ORDER_STATUSES.includes(status)) {
      throw new BadRequestException('Estado de laboratorio inválido.');
    }

    const workOrder = await this.lab.findById(id);
    if (!workOrder) {
      throw new NotFoundException('Orden de laboratorio no encontrada.');
    }
    if (workOrder.status === 'CANCELADO') {
      throw new BadRequestException(
        'No es posible cambiar el estado de una OS cancelada.',
      );
    }

    const now = new Date();
    const updated = await this.lab.updateStatus(id, {
      status,
      statusChangedBy: changedById,
      statusChangedAt: now,
    });

    // Quando a OS fica pronta, o pedido avança para separação.
    if (status === 'PRONTO_PARA_SEPARACAO') {
      const order = await this.orders.findById(workOrder.orderId);
      if (order && order.operationalStatus === 'FECHADO') {
        await this.orders.update(order.id, {
          operationalStatus: 'AGUARDANDO_SEPARACAO',
        });
      }
    }

    return updated;
  }
}
