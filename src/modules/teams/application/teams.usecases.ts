import { Inject, Injectable } from '@nestjs/common';
import type { Team } from '../domain/team';
import type { TeamRepositoryPort } from './ports/team-repository.port';
import { TEAM_REPOSITORY_PORT } from './ports/team-repository.port';

@Injectable()
/**
 * Caso de Uso: Listar todas as equipes
 * Responsável por buscar e retornar a lista completa de equipes cadastradas.
 */
export class ListTeamsUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  /**
   * Executa a listagem de equipes.
   * @returns Retorna um array com todas as equipes encontradas.
   */
  async execute(): Promise<Team[]> {
    return this.teams.findMany();
  }
}

@Injectable()
/**
 * Caso de Uso: Buscar equipe por ID
 * Responsável por localizar uma equipe específica através do seu identificador único (UUID).
 */
export class GetTeamByIdUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  /**
   * Executa a busca da equipe pelo ID.
   * @param id Identificador único da equipe.
   * @returns Retorna a equipe encontrada ou null caso não exista.
   */
  async execute(id: string): Promise<Team | null> {
    return this.teams.findById(id);
  }
}

@Injectable()
/**
 * Caso de Uso: Criar nova equipe
 * Responsável por validar e persistir uma nova equipe no banco de dados.
 */
export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  /**
   * Executa a criação da equipe.
   * @param name Nome da equipe a ser criada.
   * @returns Retorna a equipe recém-criada com seu ID e timestamps.
   */
  async execute(name: string): Promise<Team> {
    return this.teams.create(name);
  }
}

@Injectable()
/**
 * Caso de Uso: Atualizar dados da equipe
 * Responsável por alterar as informações (ex: nome) de uma equipe já existente.
 */
export class UpdateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  /**
   * Executa a atualização da equipe.
   * @param id Identificador da equipe a ser atualizada.
   * @param name Novo nome da equipe.
   * @returns Retorna a equipe atualizada.
   */
  async execute(id: string, name: string): Promise<Team> {
    return this.teams.update(id, name);
  }
}

@Injectable()
/**
 * Caso de Uso: Deletar equipe
 * Responsável por remover permanentemente uma equipe do sistema pelo seu ID.
 */
export class DeleteTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_PORT)
    private readonly teams: TeamRepositoryPort,
  ) {}

  /**
   * Executa a remoção da equipe.
   * @param id Identificador da equipe a ser removida.
   */
  async execute(id: string): Promise<void> {
    await this.teams.delete(id);
  }
}
