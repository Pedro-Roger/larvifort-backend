import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import type { PostSaleRepositoryPort } from '../application/ports/post-sale-repository.port';
import {
  POST_SALE_STATUSES,
  type PostSale,
  type PostSaleStatus,
} from '../domain/post-sale';

@Injectable()
export class PostSalePrismaRepository implements PostSaleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}
  private map(row: PostSale): PostSale {
    return row;
  }
  async findMany(status?: PostSaleStatus): Promise<PostSale[]> {
    const rows = await this.prisma.postSale.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.map(row));
  }
  async findById(id: string): Promise<PostSale | null> {
    const row = await this.prisma.postSale.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }
  async createFromDelivery(
    deliveryId: string,
    responsibleId?: string | null,
  ): Promise<PostSale> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.status !== 'ENTREGUE' || !delivery.completedAt)
      throw new ConflictException('Delivery must be completed');
    const existing = await this.prisma.postSale.findUnique({
      where: { deliveryId },
    });
    if (existing) return this.map(existing);
    const row = await this.prisma.postSale.create({
      data: {
        orderId: delivery.orderId,
        deliveryId,
        clientId: delivery.order.clientId,
        responsibleId: responsibleId ?? null,
      },
    });
    return this.map(row);
  }
  async update(
    id: string,
    data: {
      status?: PostSaleStatus;
      notes?: string | null;
      nextAction?: string | null;
      responsibleId?: string | null;
    },
  ): Promise<PostSale> {
    if (data.status && !POST_SALE_STATUSES.includes(data.status))
      throw new ConflictException('Invalid post-sale status');
    const row = await this.prisma.postSale.update({
      where: { id },
      data: {
        ...data,
        contactedAt:
          data.status && data.status !== 'AGUARDANDO_CONTATO'
            ? new Date()
            : undefined,
      },
    });
    return this.map(row);
  }
  async complete(id: string): Promise<PostSale> {
    const row = await this.prisma.postSale.update({
      where: { id },
      data: { status: 'FINALIZADO', completedAt: new Date() },
    });
    return this.map(row);
  }
}
