import {
  Body,
  Controller,
  Get,
  Optional,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OperationalMetricsService } from '../application/operational-metrics.service';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { MetricsActor } from '../domain/metrics';
import { MetricsUseCases } from '../application/metrics.usecases';
import { AnalysisMetricsDto, CreateMetricGoalDto } from './metrics.dto';
@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(
    private readonly metrics: MetricsUseCases,
    @Optional() private readonly operational?: OperationalMetricsService,
  ) {}
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

  @Get('operations/funnel') funnel() {
    return this.operational?.funnel() ?? {};
  }
  @Get('operations/stock') stock() {
    return this.operational?.stock() ?? {};
  }
  @Get('operations/logistics') logistics() {
    return this.operational?.logistics() ?? {};
  }
  @Get('operations/post-sales') postSales() {
    return this.operational?.postSales() ?? {};
  }
}
