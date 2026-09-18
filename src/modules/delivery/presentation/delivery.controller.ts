import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { DeliveryService } from '../application/delivery.service';

@ApiTags('Logística - Entrega')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Post(':id/delivery')
  async create(@Param('id') id: string) {
    return this.service.create(id);
  }

  @Patch(':id/delivery/assign')
  async assign(
    @Param('id') id: string,
    @Body() body: { driverId: string; vehicleId: string },
  ) {
    return this.service.assign(id, body.driverId, body.vehicleId);
  }

  @Patch(':id/delivery/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
