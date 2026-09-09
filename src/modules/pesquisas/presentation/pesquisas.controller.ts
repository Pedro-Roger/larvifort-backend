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
import type { FieldSearch } from '../domain/field-search';
import { ListPesquisasUseCase } from '../application/list-pesquisas.usecase';
import { CreateFieldSearchUseCase } from '../application/create-field-search.usecase';
import { GetFieldSearchByIdUseCase } from '../application/get-field-search.usecase';
import { UpdateFieldSearchUseCase } from '../application/update-field-search.usecase';
import { DeleteFieldSearchUseCase } from '../application/delete-field-search.usecase';
import { FindPesquisasQueryDto } from './dto/find-pesquisas-query.dto';
import { CreateFieldSearchDto } from './dto/create-field-search.dto';
import { UpdateFieldSearchDto } from './dto/update-field-search.dto';

// TASK 07 — presentation do FieldSearches Module (CRUD /pesquisas).
// Suporta rotas /pesquisas e /searches.
@ApiTags('Pesquisas')
@ApiBearerAuth('access-token')
@Controller(['pesquisas', 'searches'])
@UseGuards(JwtAuthGuard)
export class PesquisasController {
  constructor(
    private readonly listPesquisas: ListPesquisasUseCase,
    private readonly createFieldSearch: CreateFieldSearchUseCase,
    private readonly getFieldSearchById: GetFieldSearchByIdUseCase,
    private readonly updateFieldSearch: UpdateFieldSearchUseCase,
    private readonly deleteFieldSearch: DeleteFieldSearchUseCase,
  ) {}

  @Get()
  findMany(
    @Query() query: FindPesquisasQueryDto,
  ): Promise<Paginated<FieldSearch>> {
    return this.listPesquisas.execute(query);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<FieldSearch> {
    return this.getFieldSearchById.execute(id);
  }

  @Post()
  create(@Body() dto: CreateFieldSearchDto): Promise<FieldSearch> {
    return this.createFieldSearch.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFieldSearchDto,
  ): Promise<FieldSearch> {
    return this.updateFieldSearch.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteFieldSearch.execute(id);
  }
}
