import type { User, UserRole } from '../../domain/user';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface FindUsersFilter {
  search?: string;
  teamId?: string;
  role?: UserRole;
  active?: boolean;
  page: number;
  limit: number;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  teamId?: string | null;
  active?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  teamId?: string | null;
  active?: boolean;
}

export interface UserRepositoryPort {
  findMany(filter: FindUsersFilter): Promise<{ data: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
