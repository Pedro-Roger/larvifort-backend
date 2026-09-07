import type { CommercialGroup, Company } from '../../domain/company';

export const COMMERCIAL_GROUP_REPOSITORY_PORT =
  'COMMERCIAL_GROUP_REPOSITORY_PORT';

export interface CreateCommercialGroupData {
  name: string;
  color?: string;
}

export interface UpdateCommercialGroupData {
  name?: string;
  color?: string;
}

export interface CommercialGroupRepositoryPort {
  findAll(): Promise<CommercialGroup[]>;
  findById(id: string): Promise<CommercialGroup | null>;
  findByName(name: string): Promise<CommercialGroup | null>;
  create(data: CreateCommercialGroupData): Promise<CommercialGroup>;
  update(id: string, data: UpdateCommercialGroupData): Promise<CommercialGroup>;
  delete(id: string): Promise<void>;
  findCompaniesByGroupId(groupId: string): Promise<Company[]>;
}
