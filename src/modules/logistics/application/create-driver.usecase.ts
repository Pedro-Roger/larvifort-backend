import { Inject, Injectable } from '@nestjs/common';
import {
  LOGISTICS_REPOSITORY_PORT,
  LogisticsRepositoryPort,
} from '../application/ports/logistics-repository.port';

@Injectable()
export class CreateDriverUseCase {
  constructor(
    @Inject(LOGISTICS_REPOSITORY_PORT)
    private readonly repo: LogisticsRepositoryPort,
  ) {}

  async execute(data: {
    name: string;
    phone?: string;
    document?: string;
    region?: string;
  }) {
    return this.repo.createDriver(data);
  }
}
