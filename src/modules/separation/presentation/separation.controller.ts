import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { StartSeparationUseCase } from '../application/start-separation.usecase';
import { CompleteSeparationUseCase } from '../application/complete-separation.usecase';
import { ReportSeparationDivergenceUseCase } from '../application/report-separation-divergence.usecase';
import {
  SEPARATION_REPOSITORY_PORT,
  SeparationRepositoryPort,
} from '../application/ports/separation-repository.port';

@ApiTags('Separación y Conferência')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class SeparationController {
  constructor(
    private readonly startSeparation: StartSeparationUseCase,
    private readonly completeSeparation: CompleteSeparationUseCase,
    private readonly reportDivergence: ReportSeparationDivergenceUseCase,
    @Inject(SEPARATION_REPOSITORY_PORT)
    private readonly repository: SeparationRepositoryPort,
  ) {}

  @Get('separation/orders')
  async list() {
    return this.repository.findMany();
  }

  @Post('orders/:id/separation/start')
  async start(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.startSeparation.execute(id, userId);
  }

  @Post('orders/:id/separation/complete')
  async complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.completeSeparation.execute(id, userId);
  }

  @Post('orders/:id/separation/divergence')
  async reportSeparationDivergence(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('note') note: string,
  ) {
    return this.reportDivergence.execute(id, userId, note);
  }
}
