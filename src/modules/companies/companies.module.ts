import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ListCompaniesUseCase } from './application/list-companies.usecase';
import { GetCompanyByIdUseCase } from './application/get-company-by-id.usecase';
import { CreateCompanyUseCase } from './application/create-company.usecase';
import { UpdateCompanyUseCase } from './application/update-company.usecase';
import { DeleteCompanyUseCase } from './application/delete-company.usecase';
import { ListCommercialGroupsUseCase } from './application/list-commercial-groups.usecase';
import { GetCommercialGroupByIdUseCase } from './application/get-commercial-group-by-id.usecase';
import { CreateCommercialGroupUseCase } from './application/create-commercial-group.usecase';
import { UpdateCommercialGroupUseCase } from './application/update-commercial-group.usecase';
import { DeleteCommercialGroupUseCase } from './application/delete-commercial-group.usecase';
import { GetCompaniesByGroupIdUseCase } from './application/get-companies-by-group-id.usecase';
import { COMPANY_REPOSITORY_PORT } from './application/ports/company-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './application/ports/commercial-group-repository.port';
import {
  PRISMA_COMPANIES_TOKEN,
  PrismaCompanyRepository,
} from './infra/company.prisma.repository';
import {
  PRISMA_COMMERCIAL_GROUPS_TOKEN,
  PrismaCommercialGroupRepository,
} from './infra/commercial-group.prisma.repository';
import { CompaniesController } from './presentation/companies.controller';
import { CommercialGroupsController } from './presentation/commercial-groups.controller';

@Module({
  controllers: [CompaniesController, CommercialGroupsController],
  providers: [
    ListCompaniesUseCase,
    GetCompanyByIdUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    ListCommercialGroupsUseCase,
    GetCommercialGroupByIdUseCase,
    CreateCommercialGroupUseCase,
    UpdateCommercialGroupUseCase,
    DeleteCommercialGroupUseCase,
    GetCompaniesByGroupIdUseCase,
    PrismaCompanyRepository,
    PrismaCommercialGroupRepository,
    { provide: PRISMA_COMPANIES_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_COMMERCIAL_GROUPS_TOKEN, useExisting: PrismaService },
    { provide: COMPANY_REPOSITORY_PORT, useClass: PrismaCompanyRepository },
    {
      provide: COMMERCIAL_GROUP_REPOSITORY_PORT,
      useClass: PrismaCommercialGroupRepository,
    },
  ],
  exports: [
    COMPANY_REPOSITORY_PORT,
    COMMERCIAL_GROUP_REPOSITORY_PORT,
    ListCompaniesUseCase,
    ListCommercialGroupsUseCase,
  ],
})
export class CompaniesModule {}
