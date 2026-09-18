import type { PostSale, PostSaleStatus } from '../../domain/post-sale';
export const POST_SALE_REPOSITORY_PORT = 'POST_SALE_REPOSITORY_PORT';
export interface PostSaleRepositoryPort {
  findMany(status?: PostSaleStatus): Promise<PostSale[]>;
  findById(id: string): Promise<PostSale | null>;
  createFromDelivery(
    deliveryId: string,
    responsibleId?: string | null,
  ): Promise<PostSale>;
  update(
    id: string,
    data: {
      status?: PostSaleStatus;
      notes?: string | null;
      nextAction?: string | null;
      responsibleId?: string | null;
    },
  ): Promise<PostSale>;
  complete(id: string): Promise<PostSale>;
}
