import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { Paginated } from '../../../core/common/pagination';
import type { LabOrderRow, LabWorkOrder } from '../domain/lab-work-order';
import { GenerateLabWorkOrderUseCase } from '../application/generate-lab-work-order.usecase';
import { UpdateLabWorkOrderStatusUseCase } from '../application/update-lab-work-order-status.usecase';
import { ListLabOrdersUseCase } from '../application/list-lab-orders.usecase';
import { GetLabWorkOrderUseCase } from '../application/get-lab-work-order.usecase';
import { GenerateLabWorkOrderDto } from './dto/generate-lab-work-order.dto';
import { UpdateLabWorkOrderStatusDto } from './dto/update-lab-work-order-status.dto';

@ApiTags('Labóratorio')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class LabController {
  constructor(
    private readonly generateLabWorkOrder: GenerateLabWorkOrderUseCase,
    private readonly updateLabWorkOrderStatus: UpdateLabWorkOrderStatusUseCase,
    private readonly listLabOrders: ListLabOrdersUseCase,
    private readonly getLabWorkOrder: GetLabWorkOrderUseCase,
  ) {}

  @Get('lab/orders')
  @ApiOperation({
    summary: 'Pedidos fechados prontos para o laboratório',
    description:
      'Lista paginada de pedidos cerrados que podem gerar OS de laboratório.',
  })
  listOrders(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Paginated<LabOrderRow>> {
    return this.listLabOrders.execute({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('orders/:id/lab-work-order')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Gerar OS de laboratório a partir de um pedido fechado',
    description:
      'Cria uma ou mais OS de laboratório (uma por ítem de produto) com produto, ' +
      'quantidade, unidade/local e data de entrega. Requer pedido fechado e sem OS ativa.',
  })
  generate(
    @Param('id') id: string,
    @Body() dto: GenerateLabWorkOrderDto,
    @CurrentUser('id') userId: string,
  ): Promise<LabWorkOrder[]> {
    return this.generateLabWorkOrder.execute(id, userId, {
      stockUnitId: dto.stockUnitId ?? null,
      stockUnitName: dto.stockUnitName ?? null,
      stockLocationId: dto.stockLocationId ?? null,
      stockLocationName: dto.stockLocationName ?? null,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
    });
  }

  @Patch('lab/work-orders/:id/status')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Atualizar estado de uma OS de laboratório',
    description:
      'Registra responsável e horário do servidor. Quando a OS fica PRONTA_PARA_SEPARACAO, ' +
      'o pedido avança para AGUARDANDO_SEPARACAO.',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLabWorkOrderStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<LabWorkOrder> {
    return this.updateLabWorkOrderStatus.execute(id, dto.status, userId);
  }

  @Get('lab/work-orders/:id')
  @ApiOperation({
    summary: 'Buscar OS de laboratório por ID',
  })
  findById(@Param('id') id: string): Promise<LabWorkOrder> {
    return this.getLabWorkOrder.execute(id);
  }
}
