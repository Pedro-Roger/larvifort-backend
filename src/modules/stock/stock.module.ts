import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ProductsModule } from '../products/products.module';
import { STOCK_REPOSITORY_PORT } from './application/ports/stock-repository.port';
import { STOCK_INVENTORY_REPOSITORY_PORT } from './application/ports/stock-inventory-repository.port';
import { CreateStockUnitUseCase } from './application/create-stock-unit.usecase';
import { UpdateStockUnitUseCase } from './application/update-stock-unit.usecase';
import { ListStockUnitsUseCase } from './application/list-stock-units.usecase';
import { CreateStockLocationUseCase } from './application/create-stock-location.usecase';
import { UpdateStockLocationUseCase } from './application/update-stock-location.usecase';
import { ListStockLocationsUseCase } from './application/list-stock-locations.usecase';
import { GetAvailabilityUseCase } from './application/get-availability.usecase';
import { ListMovementsUseCase } from './application/list-movements.usecase';
import { ListReservationsUseCase } from './application/list-reservations.usecase';
import { RegisterMovementUseCase } from './application/register-movement.usecase';
import { CreateReservationUseCase } from './application/create-reservation.usecase';
import { CancelReservationUseCase } from './application/cancel-reservation.usecase';
import {
  PRISMA_STOCK_TOKEN,
  PrismaStockRepository,
} from './infra/stock.prisma.repository';
import {
  PRISMA_STOCK_INVENTORY_TOKEN,
  PrismaStockInventoryRepository,
} from './infra/stock-inventory.prisma.repository';
import { StockUnitsController } from './presentation/stock-units.controller';
import { StockLocationsController } from './presentation/stock-locations.controller';
import { StockAvailabilityController } from './presentation/stock-availability.controller';
import { StockMovementsController } from './presentation/stock-movements.controller';
import { StockReservationsController } from './presentation/stock-reservations.controller';

@Module({
  imports: [ProductsModule],
  controllers: [
    StockUnitsController,
    StockLocationsController,
    StockAvailabilityController,
    StockMovementsController,
    StockReservationsController,
  ],
  providers: [
    CreateStockUnitUseCase,
    UpdateStockUnitUseCase,
    ListStockUnitsUseCase,
    CreateStockLocationUseCase,
    UpdateStockLocationUseCase,
    ListStockLocationsUseCase,
    GetAvailabilityUseCase,
    ListMovementsUseCase,
    ListReservationsUseCase,
    RegisterMovementUseCase,
    CreateReservationUseCase,
    CancelReservationUseCase,
    PrismaStockRepository,
    PrismaStockInventoryRepository,
    { provide: PRISMA_STOCK_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_STOCK_INVENTORY_TOKEN, useExisting: PrismaService },
    { provide: STOCK_REPOSITORY_PORT, useClass: PrismaStockRepository },
    {
      provide: STOCK_INVENTORY_REPOSITORY_PORT,
      useClass: PrismaStockInventoryRepository,
    },
  ],
  exports: [STOCK_REPOSITORY_PORT, STOCK_INVENTORY_REPOSITORY_PORT],
})
export class StockModule {}
