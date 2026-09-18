import {
  Controller,
  Get,
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
@Controller()
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Get('deliveries')
  async list() {
    return this.service.list();
  }

  @Post('orders/:id/delivery')
  async create(@Param('id') id: string) {
    return this.service.create(id);
  }

  @Patch('orders/:id/delivery/assign')
  async assign(
    @Param('id') id: string,
    @Body() body: { driverId: string; vehicleId: string },
  ) {
    return this.service.assign(id, body.driverId, body.vehicleId);
  }

  @Patch('orders/:id/delivery/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.service.updateStatus(id, body.status);
  }

  @Patch('deliveries/:id/assign-driver')
  async assignByDelivery(
    @Param('id') id: string,
    @Body() body: { driverId: string; vehicleId: string },
  ) {
    return this.service.assignByDelivery(id, body.driverId, body.vehicleId);
  }

  @Patch('deliveries/:id/status')
  async updateByDelivery(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatusByDelivery(id, body.status);
  }

  @Post('deliveries/:id/proof')
  async proof(
    @Param('id') id: string,
    @Body() body: { proofUrl: string; notes?: string },
  ) {
    return this.service.addProof(id, body.proofUrl, body.notes);
  }
}
