# Scripts

Todos em Node, sem dependência além do que o projeto já tem.

| Script                | O que faz                                                                                                                                                                      | Onde entra                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `audit.js`            | Gate de `npm audit`: falha só em `high`/`critical` fora de uma allowlist documentada; ignora cópias que vivem apenas em `node_modules/npm/node_modules/`                       | Último passo do portão único e do CI                        |
| `release-preview.mjs` | Roda `semantic-release` em dry-run e escreve o comentário "Release prevista: X → Y" (ou "Sem release prevista") para a PR; ignora as variáveis de CI que descrevem o ref da PR | Job `release-preview` do CI, em PRs para a branch principal |
| `set-app-version.mjs` | Grava a versão no manifesto do app; recusa qualquer coisa que não seja `MAJOR.MINOR.PATCH` numérico                                                                            | `prepareCmd` do `@semantic-release/exec`                    |
| `gen-types.mjs`       | Gera os tipos do banco e só grava o arquivo se a saída contiver o tipo esperado; evita o arquivo truncado por um redirecionamento que falhou                                   | `npm run db:types` (`-- --linked` sem Docker)               |
| `functions-check.js`  | Descobre as funções serverless do projeto e roda a checagem de tipos de cada uma                                                                                               | Portão único e CI                                           |

`rules/ci/releaserc.json` é a configuração de `semantic-release` correspondente (seções das notas
em pt-BR, commit de release com `[skip ci]`), e `rules/ci/husky-pre-commit` o hook de pré-commit
que chama `lint-staged`.
