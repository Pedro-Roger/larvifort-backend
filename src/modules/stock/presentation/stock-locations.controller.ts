import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { StockLocation } from '../domain/stock-location';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from '../application/ports/stock-repository.port';
import { CreateStockLocationUseCase } from '../application/create-stock-location.usecase';
import { UpdateStockLocationUseCase } from '../application/update-stock-location.usecase';
import { ListStockLocationsUseCase } from '../application/list-stock-locations.usecase';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';
import { ListStockLocationsQueryDto } from './dto/list-stock-locations-query.dto';

@ApiTags('Stock - Locais/Berçários')
@ApiBearerAuth('access-token')
@Controller('stock/locations')
@UseGuards(JwtAuthGuard)
export class StockLocationsController {
  constructor(
    private readonly createStockLocation: CreateStockLocationUseCase,
    private readonly updateStockLocation: UpdateStockLocationUseCase,
    private readonly listStockLocations: ListStockLocationsUseCase,
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repository: StockRepositoryPort,
  ) {}

  @Get()
  async findMany(
    @Query() query: ListStockLocationsQueryDto,
  ): Promise<StockLocation[]> {
    return this.listStockLocations.execute(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<StockLocation | null> {
    return this.repository.findLocationById(id);
  }

  @Post()
  async create(@Body() dto: CreateStockLocationDto): Promise<StockLocation> {
    return this.createStockLocation.execute(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockLocationDto,
  ): Promise<StockLocation> {
    return this.updateStockLocation.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.repository.deleteLocation(id);
  }
}
