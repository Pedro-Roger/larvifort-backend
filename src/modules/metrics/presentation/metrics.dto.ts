import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { metricTypes, metricPeriods } from '../domain/metrics';
import type { MetricType, MetricPeriod } from '../domain/metrics';
export class AnalysisMetricsDto {
  @IsUUID() teamId!: string;
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  userIds?: string[];
  @IsIn(metricTypes) type!: MetricType;
  @IsIn(metricPeriods) period!: MetricPeriod;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
export class CreateMetricGoalDto {
  @IsUUID() teamId!: string;
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  userIds!: string[];
  @IsIn(metricTypes) type!: MetricType;
  @IsIn(metricPeriods) period!: MetricPeriod;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsString() @MaxLength(120) name!: string;
  @IsNumber() @IsPositive() target!: number;
}
