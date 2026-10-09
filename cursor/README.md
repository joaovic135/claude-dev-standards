# Regras para o Cursor

Copie `rules/*.mdc` para `.cursor/rules/` do projeto.

| Arquivo                     | Escopo           | Conteúdo                                                                                                                  |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `regras-do-projeto.mdc`     | sempre           | Resumo do contrato do `CLAUDE.md`: invariantes, fronteiras, convenções, commits. Mantenha em sincronia com o `CLAUDE.md`. |
| `clean-code-principles.mdc` | `**/*.{ts,tsx}`  | KISS, DRY, AHA, YAGNI, imutabilidade e legibilidade, com exemplos                                                         |
| `solid-principles.mdc`      | `**/*.{ts,tsx}`  | SOLID aplicado a React Native, com exemplos                                                                               |
| `custom-hooks-rules.mdc`    | `**/*.{ts,tsx}`  | Quando criar (ou não) um custom hook: árvore de decisão                                                                   |
| `route-file-structure.mdc`  | rotas e features | Rota é arquivo puro; componentes, hooks e utils vivem na feature correspondente                                           |

As quatro últimas são de aplicação por glob e não dependem do projeto. A primeira é o único ponto
que precisa de edição quando o `CLAUDE.md` muda.
