import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { FieldSearch } from '../domain/field-search';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import { FIELD_SEARCH_REPOSITORY_PORT } from './ports/field-repository.port';

@Injectable()
export class GetFieldSearchByIdUseCase {
  constructor(
    @Inject(FIELD_SEARCH_REPOSITORY_PORT)
    private readonly pesquisas: FieldSearchRepositoryPort,
  ) {}

  async execute(id: string): Promise<FieldSearch> {
    const secao = await this.pesquisas.findById(id);
    if (!secao) {
      throw new NotFoundException('Pesquisa não encontrada.');
    }
    return secao;
  }
}
