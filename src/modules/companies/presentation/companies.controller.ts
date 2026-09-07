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
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { Paginated } from '../../../core/common/pagination';
import type { Company } from '../domain/company';
import { ListCompaniesUseCase } from '../application/list-companies.usecase';
import { GetCompanyByIdUseCase } from '../application/get-company-by-id.usecase';
import { CreateCompanyUseCase } from '../application/create-company.usecase';
import { UpdateCompanyUseCase } from '../application/update-company.usecase';
import { DeleteCompanyUseCase } from '../application/delete-company.usecase';
import { FindCompaniesQueryDto } from './dto/find-companies-query.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

// TASK 03 — presentation do Companies Module (CRUD Empresa).
// Suporta rotas /companies (GOAL) e /empresas (SPECS).
@Controller(['companies', 'empresas'])
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    private readonly listCompanies: ListCompaniesUseCase,
    private readonly getCompanyById: GetCompanyByIdUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
    private readonly deleteCompany: DeleteCompanyUseCase,
  ) {}

  @Get()
  findMany(@Query() query: FindCompaniesQueryDto): Promise<Paginated<Company>> {
    return this.listCompanies.execute(query);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Company> {
    return this.getCompanyById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.createCompany.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.updateCompany.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCompany.execute(id);
  }
}
