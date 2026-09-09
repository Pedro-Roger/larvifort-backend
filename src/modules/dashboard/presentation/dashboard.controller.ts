import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardUseCase } from '../application/dashboard.use-case';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardUseCase: DashboardUseCase) {}

  @Get('stats')
  async stats() {
    const [resumo, frequenciaVisitas, atividadeClientes, taxaVendas, workload] =
      await Promise.all([
        this.dashboardUseCase.resumo(),
        this.dashboardUseCase.frequenciaVisitas(),
        this.dashboardUseCase.atividadeClientes(),
        this.dashboardUseCase.taxaVendas(),
        this.dashboardUseCase.workload(),
      ]);

    return {
      ...resumo,
      ...taxaVendas,
      teamMembers: workload,
      visitData: [],
      frequencyData: frequenciaVisitas,
      clientActivity: atividadeClientes,
      salesPorPessoa: [],
      totalTasks: workload.reduce(
        (total, member) =>
          total + member.tarefasAbertas + member.tarefasEmAndamento,
        0,
      ),
    };
  }

  @Get('charts')
  async charts() {
    const metas = await this.dashboardUseCase.metas();

    return {
      goalData: [
        {
          vendedor: 'Geral',
          valorAtual: metas.valorAtual,
          valorMeta: metas.valorMeta,
          volumeAtual: 0,
          volumeMeta: metas.metaVolume,
        },
      ],
    };
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Obtém o resumo do dashboard' })
  resumo() {
    return this.dashboardUseCase.resumo();
  }

  @Get('frequencia-visitas')
  @ApiOperation({ summary: 'Obtém a frequência de visitas' })
  frequenciaVisitas() {
    return this.dashboardUseCase.frequenciaVisitas();
  }

  @Get('atividade-clientes')
  @ApiOperation({ summary: 'Obtém a atividade dos clientes' })
  atividadeClientes() {
    return this.dashboardUseCase.atividadeClientes();
  }

  @Get('taxa-vendas')
  @ApiOperation({ summary: 'Obtém a taxa e os indicadores de vendas' })
  taxaVendas() {
    return this.dashboardUseCase.taxaVendas();
  }

  @Get('metas')
  @ApiOperation({ summary: 'Obtém os indicadores de metas' })
  metas() {
    return this.dashboardUseCase.metas();
  }

  @Get('workload')
  @ApiOperation({ summary: 'Obtém a carga de trabalho da equipe' })
  workload() {
    return this.dashboardUseCase.workload();
  }
}
