# Spec 04 — criação guiada, templates e rollout

## Payload de criação

```json
{
  "name": "Atendimento de clientes",
  "templateId": null,
  "columns": [
    { "name": "Novos", "color": "sky", "order": 0 },
    { "name": "Em atendimento", "color": "violet", "order": 1 },
    { "name": "Resolvidos", "color": "emerald", "order": 2 }
  ]
}
```

Templates opt-in: vazio, pipeline comercial, atendimento, operações e
desenvolvimento. Um template contém apenas configuração, nunca IDs, tarefas ou
usuários de outro ambiente.

## Rollout seguro

1. Criar tabelas/campos sem remover os antigos.
2. Publicar backend compatível com `status` e `columnId`.
3. Migrar projetos com tarefas para colunas de transição.
4. Publicar frontend sem fallback/mock.
5. Validar contagens e movimentos em staging e produção.
6. Descontinuar o status legado somente depois da adoção completa.

Não limpar dados existentes durante a migração. Toda remoção exige backup e
confirmação explícita. O backend deve ser publicado antes do frontend; a VPS
Aquafort fica fora do escopo.
