import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { StockReservation } from '../domain/stock-reservation';
import { CreateReservationUseCase } from '../application/create-reservation.usecase';
import { CancelReservationUseCase } from '../application/cancel-reservation.usecase';
import { CreateReservationDto } from './dto/create-reservation.dto';

@ApiTags('Stock - Reservas')
@ApiBearerAuth('access-token')
@Controller('stock/reservations')
@UseGuards(JwtAuthGuard)
export class StockReservationsController {
  constructor(
    private readonly createReservation: CreateReservationUseCase,
    private readonly cancelReservation: CancelReservationUseCase,
  ) {}

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
