import { Inject, Injectable } from '@nestjs/common';
import {
  DELIVERY_REPOSITORY_PORT,
  DeliveryRepositoryPort,
} from '../application/ports/delivery-repository.port';
import type { DeliveryStatus } from '../domain/delivery';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly repo: DeliveryRepositoryPort,
  ) {}

  async create(orderId: string) {
    return this.repo.create({ orderId });
  }

  async assign(orderId: string, driverId: string, vehicleId: string) {
    return this.repo.update(orderId, {
      driverId,
      vehicleId,
      status: 'MOTORISTA_DEFINIDO',
    });
  }

  async updateStatus(orderId: string, status: string) {
    return this.repo.update(orderId, { status: status as DeliveryStatus });
  }
}
