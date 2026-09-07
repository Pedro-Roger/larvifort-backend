import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListClientsUseCase } from './application/list-clients.usecase';
import { GetClientByIdUseCase } from './application/get-client-by-id.usecase';
import { CreateClientUseCase } from './application/create-client.usecase';
import { UpdateClientUseCase } from './application/update-client.usecase';
import { DeleteClientUseCase } from './application/delete-client.usecase';
import { CLIENT_REPOSITORY_PORT } from './application/ports/client-repository.port';
import {
  PRISMA_CLIENTS_TOKEN,
  PrismaClientRepository,
} from './infra/client.prisma.repository';
import { ClientsController } from './presentation/clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [
    ListClientsUseCase,
    GetClientByIdUseCase,
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    PrismaClientRepository,
    { provide: PRISMA_CLIENTS_TOKEN, useExisting: PrismaService },
    { provide: CLIENT_REPOSITORY_PORT, useClass: PrismaClientRepository },
  ],
  exports: [
    CLIENT_REPOSITORY_PORT,
    ListClientsUseCase,
    GetClientByIdUseCase,
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
  ],
})
export class ClientsModule {}
