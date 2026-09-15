import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { Order } from '../domain/order';
import type {
  CreateOrderInput,
  OrderRepositoryPort,
} from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from '../../clients/application/ports/client-repository.port';
import {
  AUTOMATION_OUTBOX_PORT,
  type AutomationOutboxPort,
} from '../../automations/application/ports/automation-outbox.port';
import {
  AUTOMATION_REPOSITORY_PORT,
  type AutomationRepositoryPort,
} from '../../automations/application/ports/automation-repository.port';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly ordersRepo: OrderRepositoryPort,
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clientsRepo: ClientRepositoryPort,
    @Optional()
    @Inject(AUTOMATION_OUTBOX_PORT)
    private readonly outbox?: AutomationOutboxPort,
    @Optional()
    @Inject(AUTOMATION_REPOSITORY_PORT)
    private readonly automationsRepo?: AutomationRepositoryPort,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    if (!input.clientId?.trim()) {
      throw new BadRequestException('Cliente é obrigatório para criar pedido.');
    }

    const client = await this.clientsRepo.findById(input.clientId.trim());
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos 1 item.');
    }

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      if (!item.productName?.trim()) {
        throw new BadRequestException(`Item ${i + 1}: nome do produto é obrigatório.`);
      }
      if (item.quantity === undefined || item.quantity <= 0) {
        throw new BadRequestException(`Item ${i + 1}: quantidade deve ser maior que zero.`);
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        throw new BadRequestException(`Item ${i + 1}: preço unitário deve ser maior ou igual a zero.`);
      }
    }

    const companyId = input.companyId || client.empresaId || null;
    const orderNumber = input.orderNumber || (await this.ordersRepo.generateNextOrderNumber());

    const created = await this.ordersRepo.create({
      ...input,
      companyId,
      orderNumber,
      status: input.status ?? 'PEDIDO',
      phase: input.phase ?? 'ABERTO',
    });

    if (this.outbox && this.automationsRepo) {
      try {
        const automations = await this.automationsRepo.findActiveByTrigger('ORDER_CREATED');
        const projectIds = Array.from(new Set(automations.map((a) => a.projetoId)));
        for (const projetoId of projectIds) {
          await this.outbox.publish({
            id: `evt-ord-${created.id}-${projetoId}-${Date.now()}`,
            type: 'ORDER_CREATED',
            projetoId,
            aggregateId: created.id,
            payload: {
              orderId: created.id,
              orderNumber: created.orderNumber,
              totalAmount: created.totalAmount,
              status: created.status,
              phase: created.phase,
              clientId: created.clientId,
              clientName: created.clientName,
            },
            depth: 0,
            causationChain: [],
            occurredAt: new Date(),
          });
        }
      } catch {
        // Falha no outbox não impede a criação do pedido
      }
    }

    return created;
  }
}
