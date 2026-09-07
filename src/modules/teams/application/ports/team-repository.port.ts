// TASK 02 — porta de repositório de Team.
// Contrato para injeção de dependência (não existe em runtime).

import type { Team } from '../../domain/team';

export const TEAM_REPOSITORY_PORT = 'TEAM_REPOSITORY_PORT';

export interface TeamRepositoryPort {
  findMany(): Promise<Team[]>;
  findById(id: string): Promise<Team | null>;
  findByName(name: string): Promise<Team | null>;
  create(name: string): Promise<Team>;
  update(id: string, name: string): Promise<Team>;
  delete(id: string): Promise<void>;
}