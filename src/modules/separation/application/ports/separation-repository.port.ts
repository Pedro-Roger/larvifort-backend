import type {
  OrderSeparation,
  SeparationStatus,
} from '../../domain/order-separation';

export const SEPARATION_REPOSITORY_PORT = 'SEPARATION_REPOSITORY_PORT';

export interface UpdateSeparationInput {
  status: SeparationStatus;
  startedAt?: Date | null;
  startedBy?: string | null;
  completedAt?: Date | null;
  completedBy?: string | null;
  divergenceNote?: string | null;
  divergenceAt?: Date | null;
  divergenceBy?: string | null;
}

export interface SeparationRepositoryPort {
  findByOrderId(orderId: string): Promise<OrderSeparation | null>;
  create(orderId: string): Promise<OrderSeparation>;
  update(
    orderId: string,
    data: UpdateSeparationInput,
  ): Promise<OrderSeparation>;
}
