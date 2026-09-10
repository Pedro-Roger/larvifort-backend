# Spec 01 — projetos, quadros e colunas reais

## Modelo

Manter `Projeto` como recurso de quadro e adicionar `ProjetoColuna`:

- `id` UUID, `projetoId` UUID, `name`, `color`, `order`;
- `outcomeKey` opcional, `isArchived`, `createdAt`, `updatedAt`;
- FK do projeto com cascade controlado;
- índices por projeto/ordem e projeto/arquivamento;
- nome único entre colunas ativas do mesmo projeto.

Adicionar `columnId` nullable em `Task`. Enquanto houver compatibilidade,
`status` continua aceito, mas o Kanban novo opera por `columnId`.

## API

- `GET /api/v1/projects/:projectId` retorna projeto e colunas ordenadas;
- `POST /api/v1/projects` recebe `{ name, columns[] }` em transação;
- `PATCH` e `DELETE /api/v1/projects/:projectId`;
- `POST/PATCH/DELETE /api/v1/projects/:projectId/columns/:columnId`;
- `POST /api/v1/projects/:projectId/columns`;
- `PATCH /api/v1/projects/:projectId/columns/order`;
- `PATCH /api/v1/tasks/:taskId/column`.

A criação exige ao menos uma coluna. Excluir coluna exige destino para as
tarefas; a última coluna ativa não pode ser excluída. Arquivamento é preferido
à exclusão quando existir histórico ou integração dependente.

## UX

O modal de quadro terá nome e uma lista editável de colunas, permitindo
adicionar, remover, reordenar, editar nome e escolher cor. Pode iniciar vazio ou
usar template explícito. O Kanban renderiza somente a resposta da API.

## Migração e aceite

Criar colunas de transição somente para projetos que já tenham tarefas,
mapeando o status antigo. Não apagar dados. Dois quadros devem poder ter
conjuntos de colunas diferentes, e recarregar a página deve preservar tudo.
