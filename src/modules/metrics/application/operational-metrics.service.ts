import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class OperationalMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async funnel() {
    const [orders, lab, separation, deliveries, postSales] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['operationalStatus'],
        _count: { _all: true },
      }),
      this.prisma.labWorkOrder.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.orderSeparation.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.delivery.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.postSale.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    return {
      orders,
      laboratory: lab,
      separation,
      logistics: deliveries,
      postSales,
    };
  }

  async stock() {
    const [levels, reservations] = await Promise.all([
      this.prisma.stockLevel.findMany(),
      this.prisma.stockReservation.groupBy({
        by: ['status'],
        _sum: { quantity: true },
        _count: { _all: true },
      }),
    ]);
    return {
      levels: levels.map((level) => ({
        productId: level.productId,
        unitId: null,
        locationId: level.stockLocationId,
        quantity: level.quantity,
        reserved: level.reserved,
        available: level.quantity - level.reserved,
      })),
      reservations,
    };
  }

  async logistics() {
    const [byStatus, byDriver, problems] = await Promise.all([
      this.prisma.delivery.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.delivery.groupBy({
        by: ['driverId'],
        _count: { _all: true },
      }),
      this.prisma.delivery.count({ where: { status: 'PROBLEMA' } }),
    ]);
    return { byStatus, byDriver, problems };
  }

  async postSales() {
    const [byStatus, open, completed] = await Promise.all([
      this.prisma.postSale.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.postSale.count({ where: { status: { not: 'FINALIZADO' } } }),
      this.prisma.postSale.count({ where: { status: 'FINALIZADO' } }),
    ]);
    return { byStatus, open, completed };
  }
}
