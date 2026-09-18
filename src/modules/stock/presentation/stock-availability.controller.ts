import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { AvailabilityRow } from '../domain/availability';
import { GetAvailabilityUseCase } from '../application/get-availability.usecase';
import { GetAvailabilityQueryDto } from './dto/get-availability-query.dto';

@ApiTags('Stock - Disponibilidad')
@ApiBearerAuth('access-token')
@Controller('stock/availability')
@UseGuards(JwtAuthGuard)
export class StockAvailabilityController {
  constructor(private readonly getAvailability: GetAvailabilityUseCase) {}

  @Get()
  async find(
    @Query() query: GetAvailabilityQueryDto,
  ): Promise<AvailabilityRow[]> {
    return this.getAvailability.execute(query);
  }
}
