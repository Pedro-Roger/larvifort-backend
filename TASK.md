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

## API-011 — Compromissos vinculados a clientes reais (P0)

- Tornar `clienteId` obrigatório nas novas criações do fluxo de agenda.
- Validar o cliente antes de persistir e nunca interpretar `empresaId` como
  cliente.
- Retornar a projeção mínima do cliente nas leituras de compromisso.
- Preservar leitura de compromissos legados sem cliente e compatibilidade de
  `empresaId` sem usá-lo como fallback.
- Cobrir cliente válido, cliente inexistente e ID de empresa enviado como
  cliente.

## API-012 — Automação de compromisso para card (P0, depende de API-011)

- Adicionar `APPOINTMENT_CREATED` e `CREATE_APPOINTMENT_TASK` aos contratos de
  automação.
- Validar `targetColumnId` no projeto da automação.
- Estender `Task` com tipo `GERAL|COMPROMISSO`, `appointmentId` único e
  `clienteId`.
- Publicar o evento após criar o compromisso e gerar card com cliente,
  atividade, data, horário e endereço.
- Garantir idempotência por compromisso+automação e registrar falhas/retries no
  histórico sem desfazer o compromisso.

## API-013 — Confirmação de atividade com check-in (P0, depende de API-012)

- Criar `TaskActivityConfirmation` um-para-um com task.
- Implementar `POST /tasks/:id/confirm-activity` com latitude, longitude e
  precisão validadas.
- Gravar `confirmedAt` no servidor e `confirmedById` pelo JWT.
- Autorizar pelas regras do quadro, com responsável/admin como política base.
- Retornar `409` na repetição e impedir confirmação de task geral.
- Cobrir privacidade de logs, concorrência e resposta com confirmação anexada.

## API-014 — Contratos, migrations e fluxo e2e (P0, depende de API-013)

- Criar migrations Knex preservando tasks e compromissos existentes.
- Atualizar domínio, ports, DTOs, repositórios, Swagger e eventos.
- Testar compromisso → outbox → automação → card → confirmação.
- Validar cenário sem automação, retry sem duplicação, 401, 403, 404, 409 e
  coordenadas inválidas.
- Publicar e validar backend antes de liberar o frontend dependente.

## Gate de cada tarefa

Executar `npx tsc --noEmit`, lint, unit, e2e e cobertura do módulo ≥80%.
Migration e alterações destrutivas exigem revisão separada.
