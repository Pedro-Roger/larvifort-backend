import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { StockMovement } from '../domain/stock-movement';
import { RegisterMovementUseCase } from '../application/register-movement.usecase';
import { ListMovementsUseCase } from '../application/list-movements.usecase';
import { CreateMovementDto } from './dto/create-movement.dto';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';

@ApiTags('Stock - Movimientos')
@ApiBearerAuth('access-token')
@Controller('stock/movements')
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
  constructor(
    private readonly registerMovement: RegisterMovementUseCase,
    private readonly listMovements: ListMovementsUseCase,
  ) {}

  @Get()
  async findMany(
    @Query() query: ListMovementsQueryDto,
  ): Promise<StockMovement[]> {
    return this.listMovements.execute(query);
  }

  @Post()
  async create(@Body() dto: CreateMovementDto): Promise<StockMovement> {
    return this.registerMovement.execute(dto);
  }
}
