import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ClientsModule } from '../clients/clients.module';
import { AutomationsModule } from '../automations/automations.module';
import { StockModule } from '../stock/stock.module';
import { CreateOrderUseCase } from './application/create-order.usecase';
import { ListOrdersUseCase } from './application/list-orders.usecase';
import { GetOrderByIdUseCase } from './application/get-order-by-id.usecase';
import { GetOrderByNumberUseCase } from './application/get-order-by-number.usecase';
import { UpdateOrderUseCase } from './application/update-order.usecase';
import { CancelOrderUseCase } from './application/cancel-order.usecase';
import { CloseOrderUseCase } from './application/close-order.usecase';
import { GetOrderStatsUseCase } from './application/get-order-stats.usecase';
import { DeleteOrderUseCase } from './application/delete-order.usecase';
import { GetOrderStockOptionsUseCase } from './application/get-order-stock-options.usecase';
import { ReserveOrderStockUseCase } from './application/reserve-order-stock.usecase';
import { ReleaseOrderStockUseCase } from './application/release-order-stock.usecase';
import { CustomerConfirmOrderUseCase } from './application/customer-confirm-order.usecase';
import { OrderCustomerChangeRequestUseCase } from './application/order-customer-change-request.usecase';
import { ORDER_REPOSITORY_PORT } from './application/ports/order-repository.port';
import {
  PRISMA_ORDERS_TOKEN,
  PrismaOrderRepository,
} from './infra/order.prisma.repository';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [ClientsModule, AutomationsModule, StockModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderByIdUseCase,
    GetOrderByNumberUseCase,
    UpdateOrderUseCase,
    CancelOrderUseCase,
    CloseOrderUseCase,
    GetOrderStatsUseCase,
    DeleteOrderUseCase,
    GetOrderStockOptionsUseCase,
    ReserveOrderStockUseCase,
    ReleaseOrderStockUseCase,
    CustomerConfirmOrderUseCase,
    OrderCustomerChangeRequestUseCase,
    PrismaOrderRepository,
    { provide: PRISMA_ORDERS_TOKEN, useExisting: PrismaService },
    { provide: ORDER_REPOSITORY_PORT, useClass: PrismaOrderRepository },
  ],
  exports: [
    ORDER_REPOSITORY_PORT,
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderByIdUseCase,
    GetOrderByNumberUseCase,
    UpdateOrderUseCase,
    CancelOrderUseCase,
    GetOrderStatsUseCase,
    DeleteOrderUseCase,
  ],
})
export class OrdersModule {}
