import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListPesquisasUseCase } from './application/list-pesquisas.usecase';
import { CreateFieldSearchUseCase } from './application/create-field-search.usecase';
import { GetFieldSearchByIdUseCase } from './application/get-field-search.usecase';
import { UpdateFieldSearchUseCase } from './application/update-field-search.usecase';
import { DeleteFieldSearchUseCase } from './application/delete-field-search.usecase';
import { FIELD_SEARCH_REPOSITORY_PORT } from './application/ports/field-repository.port';
import {
  PRISMA_FIELD_SEARCH_TOKEN,
  PrismaFieldSearchRepository,
} from './infra/field.prisma.repository';
import { PesquisasController } from './presentation/pesquisas.controller';

@Module({
  controllers: [PesquisasController],
  providers: [
    ListPesquisasUseCase,
    CreateFieldSearchUseCase,
    GetFieldSearchByIdUseCase,
    UpdateFieldSearchUseCase,
    DeleteFieldSearchUseCase,
    PrismaFieldSearchRepository,
    {
      provide: FIELD_SEARCH_REPOSITORY_PORT,
      useClass: PrismaFieldSearchRepository,
    },
    {
      provide: PRISMA_FIELD_SEARCH_TOKEN,
      useExisting: PrismaService,
    },
  ],
  exports: [
    FIELD_SEARCH_REPOSITORY_PORT,
    ListPesquisasUseCase,
    CreateFieldSearchUseCase,
    GetFieldSearchByIdUseCase,
    UpdateFieldSearchUseCase,
    DeleteFieldSearchUseCase,
  ],
})
export class PesquisasModule {}
