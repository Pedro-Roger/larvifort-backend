# Spec 02 — regras personalizadas e permissões

## Modelo `ProjetoRegra`

Campos: `id`, `projetoId`, `name`, `description`, `action` (create/read/update/
delete/move/order/view), `appliesTo` (user/team/role/all), `appliesToId`,
`restrictionLevel` (all/own/team/none), `columnScope` JSON, `isActive`,
`priority`, `createdBy`, timestamps e `deletedAt`.

Uma regra somente decide se a ação é permitida. Conflitos usam prioridade
explícita. O padrão é negar ação não coberta por permissão válida, exceto a
leitura básica definida para o quadro.

## API

`GET/POST /projects/:projectId/rules`, `PATCH/DELETE
/projects/:projectId/rules/:ruleId`, toggle, reorder e
`POST /projects/:projectId/rules/validate`.

A validação retorna `{ isAllowed, reason, matchedRuleId }`. IDs, escopos e
colunas são conferidos no backend. Delete é soft delete e toda decisão é
auditada.

## Melhorias

Adicionar simulação antes de salvar, razão segura para o usuário, isolamento
entre quadros/empresas e testes de negação. Mover entre colunas deve poder ter
permissão diferente de editar o card.
