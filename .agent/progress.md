# Agent Progress

## Current Task

API-001 — Maintain CRM 360 backend source of truth (2026-09-16).
Única tarefa selecionada: prioridade 1, sem dependências; `active` legado tratado como candidato inacabado. API-002 a API-005 não foram iniciadas nesta execução nem tiveram status normalizado.

## Status

Bloqueada, não concluída: falta decisão humana sobre fonte canônica do dashboard, unidade de volume e contrato mínimo dos gráficos. Detalhes em `.agent/tasks.json` e `.agent/decisions.md`.

## Histórico — Completed (registro anterior, não conclusão atual)

- SPEC.md describes lavifort-API as the backend source of truth for LarviFort CRM 360.
- ARCHITECTURE.md documents backend stack, module boundaries, production safety and VPS separation from Aquafort.
- .agent/tasks.json now contains active API tasks for CRM source of truth, layered architecture, auditability, safe automations and verification.
- scripts/verify.sh was run successfully after fixing current lint/test issues.
- scripts/agent-loop.sh was updated for the installed OpenCode CLI: `opencode run` receives the prompt as a positional argument instead of unsupported `--prompt`.

## Histórico — Validation (registro anterior)

- `./scripts/verify.sh` passed.
- Lint passed.
- Test suite passed: 120 suites, 503 tests.
- Build passed.

Esses resultados históricos não comprovam todos os gates: o harness pula typecheck ausente. Ver lição em `.agent/failures.md`.

## Avaliação atual — 2026-09-16

- Evidências verificadas pela sessão principal: dashboard fixa `visitData: []`, `salesPorPessoa: []` e `volumeAtual: 0` (`src/modules/dashboard/presentation/dashboard.controller.ts:25,28,47`), apesar de haver consultas persistidas em Sale/Meta. Métricas usam Order/MetricGoal; não trocar fontes nem reduzir critérios silenciosamente.
- `npx tsc --noEmit` falhou duas vezes: TS2554 em `src/modules/appointments/presentation/appointments.controller.spec.ts:79:37` (1 argumento, esperados 2). `create` exige `currentUserId` (`appointments.controller.ts:120-123`). Falha preexistente preservada; nenhum gate completo declarado verde.
- `./scripts/verify.sh` retornou exit 0 duas vezes: lint, 120 suítes/503 testes e build passaram, com `VERIFICATION_PASS`. Porém, pulou typecheck por ausência do script npm; build exclui specs. Log: `/private/var/folders/ql/bz28xfxd04j_r29svf6fyjk80000gn/T/opencode/lavifort-api-verification.log` (linha 22). E2e e cobertura não executados nesta avaliação bloqueada.
- Observação secundária de segurança, não iniciada/corrigida: controller do dashboard sem `JwtAuthGuard` (linhas 1-8); guard global apenas `ThrottlerGuard` (`src/app.module.ts:79-84`). Evidência estática, sem teste de endpoint; acompanhar separadamente.
- `npm ci` executado pela sessão principal reportou 11 vulnerabilidades (1 moderada, 10 altas); nenhum audit fix aplicado.
- HEAD inicial `ae9972f`; commits recentes de vínculos/métricas corroborados pela sessão principal. Nove caminhos já estavam alterados: `.agent/progress.md`, `.agent/tasks.json`, `ARCHITECTURE.md`, `SPEC.md`, `scripts/agent-loop.sh`, `src/modules/appointments/application/create-appointment.usecase.spec.ts`, `src/modules/appointments/presentation/appointments.controller.ts`, `src/modules/metrics/infra/metrics.prisma.repository.spec.ts`, `src/modules/tasks/infra/task.prisma.repository.spec.ts`.
- Alterações desta execução restritas aos quatro arquivos de estado `.agent/{tasks.json,progress.md,decisions.md,failures.md}`. Trabalho preexistente preservado; lint manteve o status dos fontes. Sem alteração de runtime, scripts, configuração, banco, segredos, deploy, commit ou push. Subagente documental não executou testes nem instalações.

## Important Context

- The installed OpenCode CLI rejects `opencode run --prompt`; use `opencode run "$(cat .agent/executor-prompt.md)"` or `opencode run -m "$OPENCODE_MODEL" "$(cat .agent/executor-prompt.md)"`.
- npm install reports deprecated packages and audit vulnerabilities, but those warnings do not currently fail harness verification.
- Do not run `npm audit fix --force` without an explicit dependency-upgrade task because it can introduce breaking changes.

## Next Action

Obter decisão humana sobre Sale/Meta versus Order/MetricGoal, unidade de volume e detalhamento/período dos gráficos antes de retomar API-001. Não avançar automaticamente para tarefas dependentes. A falha preexistente de typecheck e o falso verde do harness permanecem pendentes; esta execução não enfraqueceu checks.
