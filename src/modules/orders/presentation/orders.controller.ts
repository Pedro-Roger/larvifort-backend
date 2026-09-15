import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { Paginated } from '../../../core/common/pagination';
import type { Order, OrderStats } from '../domain/order';
import { CreateOrderUseCase } from '../application/create-order.usecase';
import { ListOrdersUseCase } from '../application/list-orders.usecase';
import { GetOrderByIdUseCase } from '../application/get-order-by-id.usecase';
import { GetOrderByNumberUseCase } from '../application/get-order-by-number.usecase';
import { UpdateOrderUseCase } from '../application/update-order.usecase';
import { CancelOrderUseCase } from '../application/cancel-order.usecase';
import { GetOrderStatsUseCase } from '../application/get-order-stats.usecase';
import { DeleteOrderUseCase } from '../application/delete-order.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@ApiTags('Pedidos')
@ApiBearerAuth('access-token')
@Controller(['orders', 'pedidos'])
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly listOrders: ListOrdersUseCase,
    private readonly getOrderById: GetOrderByIdUseCase,
    private readonly getOrderByNumber: GetOrderByNumberUseCase,
    private readonly updateOrder: UpdateOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly getOrderStats: GetOrderStatsUseCase,
    private readonly deleteOrder: DeleteOrderUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos paginados com filtros',
    description:
      'Retorna lista paginada com suporte a filtros por status, fase, cliente, projeto, busca textual e período.',
  })
  findMany(@Query() query: FindOrdersQueryDto): Promise<Paginated<Order>> {
    return this.listOrders.execute({
      ...query,
      de: query.de ? new Date(query.de) : undefined,
      ate: query.ate ? new Date(query.ate) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Resumo e métricas de pedidos',
    description:
      'Retorna total de orçamentos, pedidos, cancelados, receita total, ticket médio e contagem por fase.',
  })
  getStats(@Query() query: FindOrdersQueryDto): Promise<OrderStats> {
    return this.getOrderStats.execute({
      ...query,
      de: query.de ? new Date(query.de) : undefined,
      ate: query.ate ? new Date(query.ate) : undefined,
    });
  }

  @Get('number/:orderNumber')
  @ApiOperation({
    summary: 'Buscar pedido pelo código/número legível',
  })
  findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<Order> {
    return this.getOrderByNumber.execute(orderNumber);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
  })
  findById(@Param('id') id: string): Promise<Order> {
    return this.getOrderById.execute(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar novo pedido ou orçamento',
    description:
      'Criação atômica com validação de cliente e cálculo de itens. Suporta link_task_id para pré-vincular a um card do Kanban.',
  })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId?: string,
  ): Promise<Order> {
    return this.createOrder.execute({
      ...dto,
      creatorId: userId,
      salesRepUserId: dto.salesRepUserId || userId,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar pedido (PUT)',
  })
  updatePut(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.updateOrder.execute(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar pedido (PATCH)',
  })
  updatePatch(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.updateOrder.execute(id, dto);
  }

  @Put([':id/cancel', ':id/cancelar'])
  @ApiOperation({
    summary: 'Cancelar pedido com justificativa',
  })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<Order> {
    return this.cancelOrder.execute(id, dto.reason);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Excluir pedido (soft delete)',
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteOrder.execute(id);
  }
}
