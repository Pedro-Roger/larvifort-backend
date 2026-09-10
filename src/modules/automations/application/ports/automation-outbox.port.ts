import type {
  AutomationEvent,
  AutomationTrigger,
} from '../../domain/automation';

export const AUTOMATION_OUTBOX_PORT = 'AUTOMATION_OUTBOX_PORT';

export interface AutomationOutboxMessage {
  id: string;
  eventId: string;
  eventType: AutomationTrigger;
  projetoId: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  depth: number;
  causationChain: string[];
  attempts: number;
  availableAt: Date;
}

export interface AutomationOutboxPort {
  publish(event: AutomationEvent): Promise<void>;
  claimPending(limit: number): Promise<AutomationOutboxMessage[]>;
  markProcessed(id: string): Promise<void>;
  markRetry(id: string, availableAt: Date, error: string): Promise<void>;
  markDead(id: string, error: string): Promise<void>;
}
