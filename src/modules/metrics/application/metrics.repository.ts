import type {
  MetricTeam,
  MetricsActor,
  MetricGoal,
  NewMetricGoal,
  MetricFilter,
  MetricEvent,
} from '../domain/metrics';
export const METRICS_REPOSITORY = Symbol('METRICS_REPOSITORY');
export interface MetricsRepository {
  teams(actor: MetricsActor): Promise<MetricTeam[]>;
  goals(teamIds: string[]): Promise<MetricGoal[]>;
  create(input: NewMetricGoal & { createdBy: string }): Promise<MetricGoal>;
  events(filter: MetricFilter & { userIds: string[] }): Promise<MetricEvent[]>;
}
