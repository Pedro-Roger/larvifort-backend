import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  SEPARATION_REPOSITORY_PORT,
  SeparationRepositoryPort,
} from '../application/ports/separation-repository.port';
import {
  OrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '../../orders/application/ports/order-repository.port';

@Injectable()
export class StartSeparationUseCase {
  constructor(
    @Inject(SEPARATION_REPOSITORY_PORT)
    private readonly repo: SeparationRepositoryPort,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(orderId: string, userId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) throw new NotFoundException('Pedido não encontrado.');
    if (order.operationalStatus !== 'AGUARDANDO_SEPARACAO') {
      throw new BadRequestException('Pedido não está aguardando separação.');
    }

    let sep = await this.repo.findByOrderId(orderId);
    if (!sep) sep = await this.repo.create(orderId);

    const updated = await this.repo.update(orderId, {
      status: 'EM_SEPARACAO',
      startedAt: new Date(),
      startedBy: userId,
    });

    return updated;
  }
}
