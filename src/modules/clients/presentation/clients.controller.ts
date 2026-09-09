import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Client } from '../domain/client';
import { ListClientsUseCase } from '../application/list-clients.usecase';
import { GetClientByIdUseCase } from '../application/get-client-by-id.usecase';
import { CreateClientUseCase } from '../application/create-client.usecase';
import { UpdateClientUseCase } from '../application/update-client.usecase';
import { DeleteClientUseCase } from '../application/delete-client.usecase';
import { FindClientsQueryDto } from './dto/find-clients-query.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';

// TASK 04 — presentation do Clients Module (CRUD + status).
// Suporta rotas /clients (GOAL) e /clientes (SPECS).
@ApiTags('Clientes')
@ApiBearerAuth('access-token')
@Controller(['clients', 'clientes'])
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(
    private readonly listClients: ListClientsUseCase,
    private readonly getClientById: GetClientByIdUseCase,
    private readonly createClient: CreateClientUseCase,
    private readonly updateClient: UpdateClientUseCase,
    private readonly deleteClient: DeleteClientUseCase,
  ) {}

  @Get()
  findMany(@Query() query: FindClientsQueryDto): Promise<Paginated<Client>> {
    return this.listClients.execute(query);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Client> {
    return this.getClientById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.createClient.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<Client> {
    return this.updateClient.execute(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateClientStatusDto,
  ): Promise<Client> {
    return this.updateClient.execute(id, { statusLead: dto.status });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteClient.execute(id);
  }
}
