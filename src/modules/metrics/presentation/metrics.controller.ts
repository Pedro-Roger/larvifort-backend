import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { MetricsActor } from '../domain/metrics';
import { MetricsUseCases } from '../application/metrics.usecases';
import { AnalysisMetricsDto, CreateMetricGoalDto } from './metrics.dto';
@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metrics: MetricsUseCases) {}
  @Get('options') options(@CurrentUser() actor: MetricsActor) {
    return this.metrics.options(actor);
  }
  @Get('goals') goals(@CurrentUser() actor: MetricsActor) {
    return this.metrics.goals(actor);
  }
  @Post('goals') create(
    @CurrentUser() actor: MetricsActor,
    @Body() dto: CreateMetricGoalDto,
  ) {
    return this.metrics.create(actor, dto);
  }
  @Get('analysis') analysis(
    @CurrentUser() actor: MetricsActor,
    @Query() dto: AnalysisMetricsDto,
  ) {
    return this.metrics.analysis(actor, dto);
  }
}
