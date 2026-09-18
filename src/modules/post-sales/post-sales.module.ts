import { Module } from '@nestjs/common';
import { PostSaleController } from './presentation/post-sale.controller';
import { PostSalePrismaRepository } from './infra/post-sale.prisma.repository';
import { POST_SALE_REPOSITORY_PORT } from './application/ports/post-sale-repository.port';
@Module({
  controllers: [PostSaleController],
  providers: [
    PostSalePrismaRepository,
    { provide: POST_SALE_REPOSITORY_PORT, useClass: PostSalePrismaRepository },
  ],
  exports: [POST_SALE_REPOSITORY_PORT],
})
export class PostSalesModule {}
