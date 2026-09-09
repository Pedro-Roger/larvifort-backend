import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FieldSearch } from '../domain/field-search';
import type {
  FieldSearchRepositoryPort,
  UpdateFieldSearchData,
} from './ports/field-repository.port';
import { FIELD_SEARCH_REPOSITORY_PORT } from './ports/field-repository.port';

@Injectable()
export class UpdateFieldSearchUseCase {
  constructor(
    @Inject(FIELD_SEARCH_REPOSITORY_PORT)
    private readonly pesquisas: FieldSearchRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateFieldSearchData): Promise<FieldSearch> {
    const existing = await this.pesquisas.findById(id);
    if (!existing) {
      throw new NotFoundException('Pesquisa não encontrada.');
    }

    if (data.larvas !== undefined && data.larvas.length < 1) {
      throw new BadRequestException('Pelo menos uma larva deve ser informada.');
    }

    const parou = data.parouLarvifort ?? existing.parouLarvifort;
    const motivos = data.motivosSaida ?? existing.motivosSaida;

    if (parou && (!motivos || motivos.length === 0)) {
      throw new BadRequestException(
        'Se o cultivo parou, pelo menos um motivo de saída deve ser informado.',
      );
    }

    if (motivos && motivos.includes('OUTRO')) {
      const outro =
        data.outroMotivo !== undefined
          ? data.outroMotivo
          : existing.outroMotivo;
      if (!outro?.trim()) {
        throw new BadRequestException(
          'É obrigatório informar outroMotivo quando OUTRO está selecionado nos motivos.',
        );
      }
    }

    if (
      data.sobrevBercario !== undefined &&
      data.sobrevBercario !== null &&
      (data.sobrevBercario < 0 || data.sobrevBercario > 100)
    ) {
      throw new BadRequestException(
        'Sobrevivência do berçário deve estar entre 0 e 100.',
      );
    }
    if (
      data.sobrevCultivo !== undefined &&
      data.sobrevCultivo !== null &&
      (data.sobrevCultivo < 0 || data.sobrevCultivo > 100)
    ) {
      throw new BadRequestException(
        'Sobrevivência do cultivo deve estar entre 0 e 100.',
      );
    }

    return this.pesquisas.update(id, {
      ...data,
      dataPesquisa: data.dataPesquisa ? new Date(data.dataPesquisa) : undefined,
    });
  }
}
