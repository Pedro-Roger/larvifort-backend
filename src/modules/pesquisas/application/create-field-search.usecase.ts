import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { FieldSearch } from '../domain/field-search';
import type {
  FieldSearchRepositoryPort,
  CreateFieldSearchData,
} from './ports/field-repository.port';
import { FIELD_SEARCH_REPOSITORY_PORT } from './ports/field-repository.port';

@Injectable()
export class CreateFieldSearchUseCase {
  constructor(
    @Inject(FIELD_SEARCH_REPOSITORY_PORT)
    private readonly pesquisas: FieldSearchRepositoryPort,
  ) {}

  async execute(input: CreateFieldSearchData): Promise<FieldSearch> {
    if (!input.larvas || input.larvas.length < 1) {
      throw new BadRequestException('Pelo menos uma larva deve ser informada.');
    }

    if (
      input.parouLarvifort &&
      (!input.motivosSaida || input.motivosSaida.length === 0)
    ) {
      throw new BadRequestException(
        'Se o cultivo parou, pelo menos um motivo de saída deve ser informado.',
      );
    }

    if (
      input.motivosSaida &&
      input.motivosSaida.includes('OUTRO') &&
      !input.outroMotivo?.trim()
    ) {
      throw new BadRequestException(
        'É obrigatório informar outroMotivo quando OUTRO está selecionado nos motivos.',
      );
    }

    if (
      input.sobrevBercario !== undefined &&
      input.sobrevBercario !== null &&
      (input.sobrevBercario < 0 || input.sobrevBercario > 100)
    ) {
      throw new BadRequestException(
        'Sobrevivência do berçário deve estar entre 0 e 100.',
      );
    }
    if (
      input.sobrevCultivo !== undefined &&
      input.sobrevCultivo !== null &&
      (input.sobrevCultivo < 0 || input.sobrevCultivo > 100)
    ) {
      throw new BadRequestException(
        'Sobrevivência do cultivo deve estar entre 0 e 100.',
      );
    }

    return this.pesquisas.create({
      ...input,
      dataPesquisa: input.dataPesquisa
        ? new Date(input.dataPesquisa)
        : new Date(),
    });
  }
}
