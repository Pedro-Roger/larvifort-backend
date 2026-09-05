---
description: Executa uma iteração controlada do Loop Engineering
agent: loop-worker
---

Leia obrigatoriamente:
- `.loop/GOAL.md`
- `.loop/STATE.md`

Analise o estado atual.

Se existir `VERIFICATION: FAIL`, corrija primeiro os problemas apontados pelo verifier.

Caso contrário, encontre a próxima menor tarefa incompleta de GOAL.md.

Execute somente uma unidade lógica de trabalho.

Execute os testes relevantes.

Atualize STATE.md.

Nunca declare o projeto inteiro concluído sem todos os critérios de GOAL.md estarem satisfeitos.