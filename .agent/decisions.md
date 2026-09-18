# Architectural Decisions

Record decisions future agents should not reopen casually.

## 2026-09-16 — API-001 bloqueada por decisão de domínio

- Decisão de execução: selecionar somente API-001 (prioridade 1, sem dependências), tratando `active` legado como trabalho inacabado. Marcar `blocked`; preservar IDs, títulos, critérios e demais tarefas. Não há aprovação de domínio nem conclusão.
- Há fontes persistidas: dashboard usa Sale/Meta (`src/modules/dashboard/infra/dashboard.prisma.repository.ts:24-32,124-143`; `prisma/schema.prisma:347-371`), enquanto métricas usam MetricGoal/Order (`src/modules/metrics/infra/metrics.prisma.repository.ts:40-51,63-82`). Não afirmar que todos os dados são mocks.
- `visitData: []`, `salesPorPessoa: []` e `volumeAtual: 0` são incondicionais (`src/modules/dashboard/presentation/dashboard.controller.ts:25,28,47`), não estados vazios derivados de medição. Os critérios de API-001 não estão demonstrados.
- Não substituir silenciosamente Sale/Meta por Order/MetricGoal, inventar agregações ou estreitar critérios para declarar conclusão. Nenhuma mudança de domínio/runtime nesta avaliação.

### Decisões humanas pendentes

1. Fonte canônica do dashboard: manter Sale/Meta ou integrar Order/MetricGoal?
2. Unidade de volume: número de pedidos, soma de quantidades dos itens ou outra medida?
3. Contrato mínimo dos gráficos: quais detalhamentos, período de referência e granularidade temporal?

Após resposta, retomar API-001 com o contrato explícito e os gates completos. Não iniciar dependentes para contornar o bloqueio.

### Acompanhamento separado, não iniciado

Inspeção estática indica ausência de `JwtAuthGuard` no dashboard e apenas `ThrottlerGuard` global (`dashboard.controller.ts:1-8`; `src/app.module.ts:79-84`). Não foi testado endpoint nem aplicada correção de segurança nesta execução.
