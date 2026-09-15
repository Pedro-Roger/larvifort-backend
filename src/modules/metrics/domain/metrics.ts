export const metricTypes = [
  'ACTIVITIES',
  'VISITS',
  'SALES',
  'PROSPECTING',
  'RETURN',
] as const;
export const metricPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;
export type MetricType = (typeof metricTypes)[number];
export type MetricPeriod = (typeof metricPeriods)[number];
export interface MetricsActor {
  id: string;
  role: string;
}
export interface MetricTeam {
  id: string;
  name: string;
  members: { id: string; name: string }[];
}
export interface MetricFilter {
  teamId: string;
  userIds?: string[];
  type: MetricType;
  period: MetricPeriod;
  startDate: string;
  endDate: string;
}
export interface NewMetricGoal extends MetricFilter {
  name: string;
  target: number;
  userIds: string[];
}
export interface MetricGoal extends NewMetricGoal {
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface MetricEvent {
  date: string;
  value: number;
  kind: 'order' | 'visit' | 'activity' | 'prospect';
  clientId?: string;
  phase?: string;
  returning?: boolean;
}
