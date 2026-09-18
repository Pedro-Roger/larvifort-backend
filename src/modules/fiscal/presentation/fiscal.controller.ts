import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { FiscalService } from '../application/fiscal.service';

@ApiTags('Fiscal - Pedidos')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class FiscalController {
  constructor(private readonly service: FiscalService) {}

  @Get(':id/fiscal')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id/fiscal')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
