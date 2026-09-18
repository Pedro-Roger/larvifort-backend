import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { StockUnit } from '../domain/stock-unit';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from '../application/ports/stock-repository.port';
import { CreateStockUnitUseCase } from '../application/create-stock-unit.usecase';
import { UpdateStockUnitUseCase } from '../application/update-stock-unit.usecase';
import { ListStockUnitsUseCase } from '../application/list-stock-units.usecase';
import { CreateStockUnitDto } from './dto/create-stock-unit.dto';
import { UpdateStockUnitDto } from './dto/update-stock-unit.dto';

@ApiTags('Stock - Unidades')
@ApiBearerAuth('access-token')
@Controller('stock/units')
@UseGuards(JwtAuthGuard)
export class StockUnitsController {
  constructor(
    private readonly createStockUnit: CreateStockUnitUseCase,
    private readonly updateStockUnit: UpdateStockUnitUseCase,
    private readonly listStockUnits: ListStockUnitsUseCase,
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repository: StockRepositoryPort,
  ) {}

  @Get()
  async findAll(): Promise<StockUnit[]> {
    return this.listStockUnits.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<StockUnit | null> {
    return this.repository.findUnitById(id);
  }

  @Post()
  async create(@Body() dto: CreateStockUnitDto): Promise<StockUnit> {
    return this.createStockUnit.execute(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStockUnitDto,
  ): Promise<StockUnit> {
    return this.updateStockUnit.execute(id, dto);
  }
}
