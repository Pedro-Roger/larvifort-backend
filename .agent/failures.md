# Known Failures and Lessons

Record recurring failures, root causes, and resolutions.

## 2026-09-16 — Falso verde recorrente do harness

- Sintoma confirmado pela sessão principal: `./scripts/verify.sh` executado duas vezes retornou exit 0 e `VERIFICATION_PASS` (lint, 120 suítes/503 testes e build passaram), mas `npx tsc --noEmit` falhou nas duas execuções.
- Falha real: TS2554 em `src/modules/appointments/presentation/appointments.controller.spec.ts:79:37`, `Expected 2 arguments, but got 1`. O teste fornece apenas DTO; `create` exige também `currentUserId` (`appointments.controller.ts:120-123`). Erro preexistente, não corrigido nesta avaliação bloqueada de API-001.
- Causa do falso verde: falta script `typecheck` em `package.json`; o harness o pula. Build usa configuração que exclui specs, portanto não substitui `npx tsc --noEmit`. Log: `/private/var/folders/ql/bz28xfxd04j_r29svf6fyjk80000gn/T/opencode/lavifort-api-verification.log`, linha 22 registra skip de typecheck.
- Lição: o sucesso histórico de `verify.sh` registrado em `progress.md` não prova todos os gates. Conferir checks realmente executados e typecheck explícito; não declarar conclusão com erro ou etapa pulada. E2e e cobertura não executados nesta avaliação.
- Estado: pendente. Nenhum check foi removido/enfraquecido; fontes, scripts e configuração preservados. API-001 permanece bloqueada por decisões de domínio, sem aproveitar esta avaliação para correções fora do escopo.
- Observação independente: `npm ci` reportou 11 vulnerabilidades (1 moderada, 10 altas). Nenhum audit fix aplicado; não executar correção forçada sem escopo autorizado.
