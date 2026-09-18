import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  SEPARATION_REPOSITORY_PORT,
  SeparationRepositoryPort,
} from '../application/ports/separation-repository.port';
import {
  OrderRepositoryPort,
  ORDER_REPOSITORY_PORT,
} from '../../orders/application/ports/order-repository.port';

@Injectable()
export class CompleteSeparationUseCase {
  constructor(
    @Inject(SEPARATION_REPOSITORY_PORT)
    private readonly repo: SeparationRepositoryPort,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(orderId: string, userId: string) {
    const sep = await this.repo.findByOrderId(orderId);
    if (!sep || sep.status !== 'EM_SEPARACAO') {
      throw new BadRequestException('Separação não iniciada ou já concluída.');
    }

    await this.repo.update(orderId, {
      status: 'SEPARADO',
      completedAt: new Date(),
      completedBy: userId,
    });

    await this.orders.update(orderId, {
      operationalStatus: 'AGUARDANDO_MOTORISTA',
    });

    return { success: true };
  }
}
