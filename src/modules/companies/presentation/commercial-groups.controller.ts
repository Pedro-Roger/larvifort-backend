import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import type { CommercialGroup, Company } from '../domain/company';
import { ListCommercialGroupsUseCase } from '../application/list-commercial-groups.usecase';
import { GetCommercialGroupByIdUseCase } from '../application/get-commercial-group-by-id.usecase';
import { CreateCommercialGroupUseCase } from '../application/create-commercial-group.usecase';
import { UpdateCommercialGroupUseCase } from '../application/update-commercial-group.usecase';
import { DeleteCommercialGroupUseCase } from '../application/delete-commercial-group.usecase';
import { GetCompaniesByGroupIdUseCase } from '../application/get-companies-by-group-id.usecase';
import { CreateCommercialGroupDto } from './dto/create-commercial-group.dto';
import { UpdateCommercialGroupDto } from './dto/update-commercial-group.dto';

// TASK 03 — presentation dos Grupos Comerciais.
// Suporta rotas /commercial-groups, /grupos e /companies/groups.
@ApiTags('Grupos comerciais')
@ApiBearerAuth('access-token')
@Controller(['commercial-groups', 'grupos', 'companies/groups'])
@UseGuards(JwtAuthGuard)
export class CommercialGroupsController {
  constructor(
    private readonly listGroups: ListCommercialGroupsUseCase,
    private readonly getGroupById: GetCommercialGroupByIdUseCase,
    private readonly createGroup: CreateCommercialGroupUseCase,
    private readonly updateGroup: UpdateCommercialGroupUseCase,
    private readonly deleteGroup: DeleteCommercialGroupUseCase,
    private readonly getCompaniesByGroupId: GetCompaniesByGroupIdUseCase,
  ) {}

  @Get()
  findAll(): Promise<CommercialGroup[]> {
    return this.listGroups.execute();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<CommercialGroup> {
    return this.getGroupById.execute(id);
  }

  @Get([':id/companies', ':id/empresas'])
  findCompanies(@Param('id') id: string): Promise<Company[]> {
    return this.getCompaniesByGroupId.execute(id);
  }

  @Post()
  create(@Body() dto: CreateCommercialGroupDto): Promise<CommercialGroup> {
    return this.createGroup.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommercialGroupDto,
  ): Promise<CommercialGroup> {
    return this.updateGroup.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteGroup.execute(id);
  }
}
