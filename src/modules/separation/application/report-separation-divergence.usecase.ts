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
export class ReportSeparationDivergenceUseCase {
  constructor(
    @Inject(SEPARATION_REPOSITORY_PORT)
    private readonly repo: SeparationRepositoryPort,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
  ) {}

  async execute(orderId: string, userId: string, note: string) {
    const sep = await this.repo.findByOrderId(orderId);
    if (!sep || sep.status === 'SEPARADO') {
      throw new BadRequestException(
        'Separação não permite divergência neste estado.',
      );
    }

    await this.repo.update(orderId, {
      status: 'DIVERGENCIA',
      divergenceNote: note,
      divergenceAt: new Date(),
      divergenceBy: userId,
    });

    return { success: true };
  }
}
