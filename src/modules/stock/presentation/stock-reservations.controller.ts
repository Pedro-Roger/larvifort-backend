import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import {
  StockReservation,
  StockReservationListItem,
} from '../domain/stock-reservation';
import { CreateReservationUseCase } from '../application/create-reservation.usecase';
import { CancelReservationUseCase } from '../application/cancel-reservation.usecase';
import { ListReservationsUseCase } from '../application/list-reservations.usecase';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';

@ApiTags('Stock - Reservas')
@ApiBearerAuth('access-token')
@Controller('stock/reservations')
@UseGuards(JwtAuthGuard)
export class StockReservationsController {
  constructor(
    private readonly createReservation: CreateReservationUseCase,
    private readonly cancelReservation: CancelReservationUseCase,
    private readonly listReservations: ListReservationsUseCase,
  ) {}

  @Get()
  async findMany(
    @Query() query: ListReservationsQueryDto,
  ): Promise<StockReservationListItem[]> {
    return this.listReservations.execute(query);
  }

  @Post()
  async create(@Body() dto: CreateReservationDto): Promise<StockReservation> {
    return this.createReservation.execute(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async cancel(@Param('id') id: string): Promise<StockReservation> {
    return this.cancelReservation.execute(id);
  }
}
