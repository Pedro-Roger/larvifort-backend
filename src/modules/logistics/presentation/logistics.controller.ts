import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Driver, Vehicle } from '../domain/logistics';
import { LOGISTICS_REPOSITORY_PORT, LogisticsRepositoryPort } from '../application/ports/logistics-repository.port';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@ApiTags('Logística - Motoristas e veículos')
@ApiBearerAuth('access-token')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(@Inject(LOGISTICS_REPOSITORY_PORT) private readonly repository: LogisticsRepositoryPort) {}

  @Get('drivers')
  listDrivers(): Promise<Driver[]> { return this.repository.listDrivers(); }

  @Post('drivers')
  createDriver(@Body() dto: CreateDriverDto): Promise<Driver> { return this.repository.createDriver(dto); }

  @Patch('drivers/:id')
  updateDriver(@Param('id') id: string, @Body() dto: UpdateDriverDto): Promise<Driver> { return this.repository.updateDriver(id, dto); }

  @Get('vehicles')
  listVehicles(): Promise<Vehicle[]> { return this.repository.listVehicles(); }

  @Post('vehicles')
  createVehicle(@Body() dto: CreateVehicleDto): Promise<Vehicle> { return this.repository.createVehicle(dto); }

  @Patch('vehicles/:id')
  updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto): Promise<Vehicle> { return this.repository.updateVehicle(id, dto); }
}
