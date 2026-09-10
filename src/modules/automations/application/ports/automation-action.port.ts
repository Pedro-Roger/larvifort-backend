import type {
  AutomationAction,
  AutomationEvent,
} from '../../domain/automation';

export const AUTOMATION_ACTION_PORT = 'AUTOMATION_ACTION_PORT';

export interface AutomationActionPort {
  execute(action: AutomationAction, event: AutomationEvent): Promise<void>;
}
