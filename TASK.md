# Plano de tarefas — módulo de Projetos LarviFort

A fila executável continua sendo `.loop/TASKS.json`. Cada tarefa deve ser
concluída com testes e evidência antes da próxima dependente.

## API-003 — Projetos e colunas reais (P0)

- Criar migration e modelos `ProjetoColuna`/`Task.columnId`.
- Criar repositórios, mappers, DTOs, use cases e controllers.
- Criar projeto com ao menos uma coluna em transação atômica.
- Implementar CRUD, ordenação e exclusão de coluna com destino de tarefas.
- Validar nomes, ordem, autorização e isolamento por projeto.
- Cobrir unit, integração e e2e (401, 403, 404, 409 e fluxo feliz).

## API-004 — Tarefas orientadas a coluna (P0, depende de API-003)

- Aceitar `columnId` em criação, edição e movimentação.
- Manter compatibilidade temporária com `status`.
- Impedir tarefa apontando para coluna de outro projeto.
- Migrar dados existentes para colunas de transição somente quando necessário.
- Registrar histórico de movimentação.

## API-005 — Regras personalizadas (P1, depende de API-003)

- Criar regras por usuário, equipe, cargo ou todos.
- Implementar ações create/read/update/delete/move/order/view.
- Implementar prioridade, ativação, soft delete e validação pré-ação.
- Retornar `matchedRuleId` e razão segura.
- Auditar decisões e testar isolamento entre projetos/empresas.

## API-006 — Automações por evento (P1, depende de API-004/005)

- Criar automações, condições, ações e histórico de execução.
- Publicar eventos idempotentes para criação, edição, movimento, atribuição e prazo.
- Implementar mover, atribuir, prioridade, tags, prazo, tarefa filha e notificação.
- Adicionar outbox/worker, retries, backoff, limite de profundidade e proteção contra ciclos.
- Expor CRUD, toggle, reorder, dry-run e histórico.

## API-007 — Templates opt-in (P2, depende de API-003/005/006)

- Criar templates vazio, comercial, atendimento, operações e desenvolvimento.
- Permitir preview e edição antes da aplicação.
- Nunca incluir IDs, tarefas ou usuários fixos de outro ambiente.

## API-008 — Rollout (P0 após API-004)

- Publicar backend compatível com `status` e `columnId`.
- Validar migração em staging e backup antes da produção.
- Remover fallback/mock e descontinuar `status` apenas após adoção completa.
- Publicar backend antes do frontend; nunca alterar a VPS Aquafort.

## Gate de cada tarefa

Executar `npx tsc --noEmit`, lint, unit, e2e e cobertura do módulo ≥80%.
Migration e alterações destrutivas exigem revisão separada.
