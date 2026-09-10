import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Automation, AutomationExecution } from '../domain/automation';
import {
  AUTOMATION_REPOSITORY_PORT,
  type AutomationRepositoryPort,
  type CreateAutomationData,
  type UpdateAutomationData,
} from './ports/automation-repository.port';

@Injectable()
export class ManageAutomationsUseCase {
  constructor(
    @Inject(AUTOMATION_REPOSITORY_PORT)
    private readonly repository: AutomationRepositoryPort,
  ) {}

  list(projetoId: string): Promise<Automation[]> {
    return this.repository.findMany(projetoId);
  }

  async get(id: string): Promise<Automation> {
    const automation = await this.repository.findById(id);
    if (!automation) throw new NotFoundException('Automação não encontrada.');
    return automation;
  }

  create(data: CreateAutomationData): Promise<Automation> {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateAutomationData): Promise<Automation> {
    await this.get(id);
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.repository.softDelete(id);
  }

  async toggle(id: string): Promise<Automation> {
    const automation = await this.get(id);
    return this.repository.update(id, { isActive: !automation.isActive });
  }

  reorder(projetoId: string, ids: string[]): Promise<void> {
    return this.repository.reorder(projetoId, ids);
  }

  history(projetoId: string, limit = 50): Promise<AutomationExecution[]> {
    return this.repository.findHistory(
      projetoId,
      Math.min(Math.max(limit, 1), 100),
    );
  }
}
