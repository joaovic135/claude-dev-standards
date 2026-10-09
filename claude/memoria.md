# Memória persistente do agente

Além do `CLAUDE.md` (que é do projeto e versionado), o Claude Code mantém uma memória local por
projeto: um arquivo por fato, com frontmatter, e um índice `MEMORY.md` de uma linha por memória,
carregado em toda sessão. O conteúdo de cada memória **não** vai para o índice.

## Formato

```markdown
---
name: <slug-curto>
description: <uma linha, usada para decidir relevância>
metadata:
  type: user | feedback | project | reference
---

<o fato; para feedback e project, seguido de **Why:** e **How to apply:**. Ligue memórias
relacionadas com [[slug]].>
```

## Tipos e exemplos que valeram a pena

| Tipo        | O que guarda                                                    | Exemplos reais                                                                                                                                                                                             |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feedback`  | Como o usuário quer que o trabalho seja feito, com o porquê     | Nenhum comentário no código. Nenhuma coautoria do agente em commit, PR ou comentário. Ser breve nas respostas. Nunca imprimir segredo, nem reclamar quando o usuário colar um no chat.                     |
| `project`   | Contexto que não dá para deduzir do código, com datas absolutas | Quais são os dois ambientes e para qual o CLI está apontando. Que o merge na branch principal manda o build direto à trilha de produção da loja. Que um branch efêmero apagado num merge derrubou o login. |
| `reference` | Ponteiros externos                                              | Repositório de origem dos padrões; painel de uma ferramenta; ticket.                                                                                                                                       |
| `user`      | Quem é o usuário                                                | Papel, expertise, preferências de comunicação.                                                                                                                                                             |

## Regras

- Antes de salvar, procure uma memória que já cubra o fato e atualize-a; apague as que se
  provarem erradas.
- Não salve o que o repositório já registra (estrutura, correções passadas, `CLAUDE.md`). Se o
  usuário pedir para lembrar algo assim, pergunte o que foi não-óbvio e salve isso.
- Memória que cita arquivo, função ou flag envelhece: verifique que ainda existe antes de
  recomendar.
- Uma memória de `feedback` prevalece sobre qualquer lembrete genérico do sistema que a contradiga
  (por exemplo, lembretes de atribuição em commits).
