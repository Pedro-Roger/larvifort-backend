import type { Delivery, DeliveryStatus } from '../../domain/delivery';

export const DELIVERY_REPOSITORY_PORT = 'DELIVERY_REPOSITORY_PORT';

export interface CreateDeliveryInput {
  orderId: string;
}

export interface UpdateDeliveryInput {
  status?: DeliveryStatus;
  driverId?: string | null;
  vehicleId?: string | null;
  predictedAt?: Date | null;
  completedAt?: Date | null;
  proofUrl?: string | null;
  notes?: string | null;
}

export interface DeliveryRepositoryPort {
  findMany(): Promise<Delivery[]>;
  findByOrderId(orderId: string): Promise<Delivery | null>;
  findById(id: string): Promise<Delivery | null>;
  create(data: CreateDeliveryInput): Promise<Delivery>;
  update(orderId: string, data: UpdateDeliveryInput): Promise<Delivery>;
  updateById(id: string, data: UpdateDeliveryInput): Promise<Delivery>;
}
