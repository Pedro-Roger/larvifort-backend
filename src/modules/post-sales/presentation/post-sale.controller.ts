import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { Inject } from '@nestjs/common';
import {
  POST_SALE_REPOSITORY_PORT,
  type PostSaleRepositoryPort,
} from '../application/ports/post-sale-repository.port';
import type { PostSaleStatus } from '../domain/post-sale';

@ApiTags('Pós-venda')
@ApiBearerAuth('access-token')
@Controller('post-sales')
@UseGuards(JwtAuthGuard)
export class PostSaleController {
  constructor(
    @Inject(POST_SALE_REPOSITORY_PORT)
    private readonly repo: PostSaleRepositoryPort,
  ) {}
  @Get() list(@Query('status') status?: PostSaleStatus) {
    return this.repo.findMany(status);
  }
  @Post('deliveries/:deliveryId') create(
    @Param('deliveryId') deliveryId: string,
    @Body() body: { responsibleId?: string },
  ) {
    return this.repo.createFromDelivery(deliveryId, body.responsibleId);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body()
    body: {
      status?: PostSaleStatus;
      notes?: string;
      nextAction?: string;
      responsibleId?: string;
    },
  ) {
    return this.repo.update(id, body);
  }
  @Post(':id/complete') complete(@Param('id') id: string) {
    return this.repo.complete(id);
  }
}
