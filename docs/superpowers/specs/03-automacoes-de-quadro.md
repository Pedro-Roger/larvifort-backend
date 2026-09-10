# Spec 03 — automações personalizadas

## Modelo `ProjetoAutomacao`

Campos: `id`, `projetoId`, `name`, `description`, `trigger`, `conditions` JSON,
`conditionMode` (AND/OR), `actions` JSON ordenado, `schedule`, `isActive`,
`priority`, `createdBy`, timestamps e `deletedAt`.

Gatilhos iniciais: tarefa criada, atualizada, movida, atribuída, vencendo e
vencida. Ações iniciais: mover, atribuir, alterar prioridade, adicionar/remover
tag, definir prazo, criar tarefa vinculada e notificar.

## Execução

Uma mutação publica evento idempotente; o executor carrega automações ativas do
quadro, avalia condições e executa ações ordenadas. Usar outbox transacional e
worker para ações não triviais. Registrar `eventId`, tentativa, duração,
resultado e erro sanitizado. Aplicar backoff, limite de retries, limite de
profundidade e proteção contra ciclos.

## API e UX

CRUD, toggle, reorder, templates, histórico de execuções e endpoint de
dry-run/teste. O editor usa “Quando / Se / Então”, com colunas, usuários e tags
reais da API. Templates são editáveis e nunca aplicados automaticamente.

## Melhorias

Versionar automação ativa, detectar referências quebradas, permitir reprocessar
falha idempotente e mostrar últimas execuções. Falha da automação não desfaz a
ação original nem bloqueia o Kanban.
