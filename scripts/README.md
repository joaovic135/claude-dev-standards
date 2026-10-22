# Scripts

Todos em Node, sem dependência além do que o projeto já tem.

| Script                      | O que faz                                                                                                                                                                      | Onde entra                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `audit.js`                  | Gate de `npm audit`: falha só em `high`/`critical` fora de uma allowlist documentada; ignora cópias que vivem apenas em `node_modules/npm/node_modules/`                       | Último passo do portão único e do CI                        |
| `release-preview.mjs`       | Roda `semantic-release` em dry-run e escreve o comentário "Release prevista: X → Y" (ou "Sem release prevista") para a PR; ignora as variáveis de CI que descrevem o ref da PR | Job `release-preview` do CI, em PRs para a branch principal |
| `set-app-version.mjs`       | Grava a versão no manifesto do app; recusa qualquer coisa que não seja `MAJOR.MINOR.PATCH` numérico                                                                            | `prepareCmd` do `@semantic-release/exec`                    |
| `gen-types.mjs`             | Gera os tipos do banco e só grava o arquivo se a saída contiver o tipo esperado; evita o arquivo truncado por um redirecionamento que falhou                                   | `npm run db:types` (`-- --linked` sem Docker)               |
| `fluxo/branch-da-issue.mjs` | Cria a branch no GitHub já ligada à issue (`createLinkedBranch`), a partir da branch de homologação ou da base informada; não faz nada se já estiver ligada                    | `npm run fluxo:branch` (ver `rules/fluxo-de-trabalho.md`)   |
| `fluxo/depende-de.mjs`      | Registra que uma issue é bloqueada por outra (`addBlockedBy`)                                                                                                                  | `npm run fluxo:depende`                                     |
| `fluxo/github.mjs`          | Cliente GraphQL mínimo: token de `GITHUB_TOKEN` ou do `git credential fill`, dono e repositório pelo `origin`                                                                  | Biblioteca dos dois acima                                   |
| `wiki/contexto.mjs`         | Junta commits, arquivos, diff e changelog entre a tag e a anterior; cruza com o bloco de fontes das páginas e renderiza o prompt                                               | Job `Atualizar wiki` (ver `rules/wiki-automatica.md`)       |
| `wiki/historico.mjs`        | Regenera a página `Histórico de versões` do wiki a partir do `CHANGELOG.md`                                                                                                    | Job `Atualizar wiki`                                        |
| `wiki/verificar-links.mjs`  | Falha se um `[[link]]` não acha página ou se falta o bloco de fontes; avisa sobre resumo, título e páginas órfãs                                                               | Job `Atualizar wiki` e `npm run wiki:links`                 |
| `functions-check.js`        | Descobre as funções serverless do projeto e roda a checagem de tipos de cada uma                                                                                               | Portão único e CI                                           |

`rules/ci/releaserc.json` é a configuração de `semantic-release` correspondente (seções das notas
em pt-BR, commit de release com `[skip ci]`), e `rules/ci/husky-pre-commit` o hook de pré-commit
que chama `lint-staged`. `rules/ci/projects.yml` é a Action que move os cards do quadro, e
`rules/ci/wiki.yml` com `rules/ci/wiki-prompt.md` o workflow e o prompt do wiki automático.
