import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { LabWorkOrder } from '../domain/lab-work-order';
import type { LabRepositoryPort } from './ports/lab-repository.port';
import { LAB_REPOSITORY_PORT } from './ports/lab-repository.port';

@Injectable()
export class GetLabWorkOrderUseCase {
  constructor(
    @Inject(LAB_REPOSITORY_PORT)
    private readonly lab: LabRepositoryPort,
  ) {}

  async execute(id: string): Promise<LabWorkOrder> {
    const workOrder = await this.lab.findById(id);
    if (!workOrder) {
      throw new NotFoundException('Orden de laboratorio no encontrada.');
    }
    return workOrder;
  }
}
