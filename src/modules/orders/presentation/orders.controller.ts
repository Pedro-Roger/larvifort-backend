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
import { CloseOrderUseCase } from '../application/close-order.usecase';
import { GetOrderStatsUseCase } from '../application/get-order-stats.usecase';
import { DeleteOrderUseCase } from '../application/delete-order.usecase';
import {
  GetOrderStockOptionsUseCase,
  OrderStockOptions,
} from '../application/get-order-stock-options.usecase';
import {
  ReserveOrderStockUseCase,
  ReserveStockResult,
} from '../application/reserve-order-stock.usecase';
import {
  ReleaseOrderStockUseCase,
  ReleaseStockResult,
} from '../application/release-order-stock.usecase';
import { CustomerConfirmOrderUseCase } from '../application/customer-confirm-order.usecase';
import { OrderCustomerChangeRequestUseCase } from '../application/order-customer-change-request.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CustomerConfirmationDto } from './dto/customer-confirmation.dto';
import { CustomerChangeRequestDto } from './dto/customer-change-request.dto';

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
    private readonly closeOrder: CloseOrderUseCase,
    private readonly getOrderStockOptions: GetOrderStockOptionsUseCase,
    private readonly reserveOrderStock: ReserveOrderStockUseCase,
    private readonly releaseOrderStock: ReleaseOrderStockUseCase,
    private readonly customerConfirmOrder: CustomerConfirmOrderUseCase,
    private readonly orderCustomerChangeRequest: OrderCustomerChangeRequestUseCase,
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
  findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<Order> {
    return this.getOrderByNumber.execute(orderNumber);
  }

  @Get(':id/stock-options')
  @ApiOperation({
    summary: 'Opções de stock (unidad/local) capaces de atender el pedido',
    description:
      'Para cada ítem del pedido consulta la disponibilidad por producto y devuelve ' +
      'las unidades/locales capaces de atender la cantidad solicitada.',
  })
  stockOptions(@Param('id') id: string): Promise<OrderStockOptions> {
    return this.getOrderStockOptions.execute(id);
  }

  @Post(':id/reserve-stock')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reservar stock del pedido antes de la confirmación final',
    description:
      'Reserva disponibilidad vinculada al pedido. Si algún ítem carece de stock, ' +
      'no avanza (400) y el pedido queda aguardando.',
  })
  reserveStock(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ReserveStockResult> {
    return this.reserveOrderStock.execute(id, userId);
  }

  @Post(':id/release-stock')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Liberar/cancelar las reservas de stock del pedido',
    description:
      'Cancela todas las reservas activas vinculadas al pedido y devuelve la ' +
      'disponibilidad; el pedido vuelve a aguardando estoque.',
  })
  releaseStock(@Param('id') id: string): Promise<ReleaseStockResult> {
    return this.releaseOrderStock.execute(id);
  }

  @Post(':id/customer-confirmation')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirmação do cliente',
    description:
      'Registra quién confirmó, cuándo (horario del servidor) y la observación; ' +
      'marca el pedido como CONFIRMADO y guarda el evento en el histórico.',
  })
  customerConfirmation(
    @Param('id') id: string,
    @Body() dto: CustomerConfirmationDto,
    @CurrentUser('id') userId: string,
  ): Promise<Order> {
    return this.customerConfirmOrder.execute(id, userId, dto.note);
  }

  @Post(':id/customer-change-request')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Solicitud de cambio del cliente',
    description:
      'Guarda la solicitud en el histórico; si el pedido estaba CONFIRMADO vuelve a ' +
      'AGUARDANDO_CONFIRMACION y limpia la confirmación previa.',
  })
  customerChangeRequest(
    @Param('id') id: string,
    @Body() dto: CustomerChangeRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<Order> {
    return this.orderCustomerChangeRequest.execute(id, userId, dto.note);
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
  cancel(@Param('id') id: string, @Body() dto: CancelOrderDto): Promise<Order> {
    return this.cancelOrder.execute(id, dto.reason);
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cerrar pedido (validación de datos obligatorios + auditoría)',
    description:
      'Valida cliente, ítems, dirección de entrega, fecha de entrega y forma de pago; ' +
      'registra closedBy (usuario actual) y closedAt, y marca el estado operacional como FECHADO.',
  })
  close(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Order> {
    return this.closeOrder.execute(id, userId);
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
