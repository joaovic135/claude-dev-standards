# Versionamento, CI e release

## O portão único

Um comando roda a verificação completa: lint, diagnóstico da plataforma, export da web (se
houver), typecheck, checagem das funções serverless, testes e o gate de auditoria de dependências.
Roda uma vez, no fim de uma tarefa. O CI roda o mesmo comando, então "passou aqui" e "passou lá"
significam a mesma coisa.

```json
"build": "npm run lint && npm run doctor && npm run build:web && npm run typecheck && npm run functions:check && npm test && node scripts/audit.js"
```

## Duas versões

| Versão                 | Quem define                                    | Onde aparece                                                   |
| ---------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| De marketing (`1.4.2`) | `semantic-release`, a partir dos commits       | tag `v1.4.2`, Release, manifesto do app, tela de perfil, lojas |
| Número de build (`51`) | Plataforma de build, com incremento automático | `buildNumber` (iOS), `versionCode` (Android)                   |

O número de build só precisa crescer; ninguém alinha com nada. A versão de marketing é a que
importa para o usuário e para as lojas, e é ela que o fluxo automatiza. A versão tem uma fonte só:
o manifesto do app lê do arquivo de versão, sem fallback.

## Regra de bump (Conventional Commits)

| Prefixo                                        | Efeito                                     |
| ---------------------------------------------- | ------------------------------------------ |
| `fix:`                                         | patch                                      |
| `feat:`                                        | minor                                      |
| `feat!:` ou rodapé `BREAKING CHANGE:`          | major                                      |
| `chore:`, `docs:`, `refactor:`, `test:`, `ci:` | nenhum: não gera release nem build de loja |

- Só `feat`, `fix`, `perf` e `revert` entram nas notas.
- A PR de desenvolvimento → principal é fundida com **merge commit**. Com squash, só o título da
  PR decide o bump.
- Um commit vazio com `fix:` é a forma oficial de gerar uma versão nova sem mudar nada (por
  exemplo, para abrir um teste externo na loja com número distinto do que está em análise).
- Configuração de referência: `rules/ci/releaserc.json` e `scripts/set-app-version.mjs`, que
  recusa qualquer versão que não seja `MAJOR.MINOR.PATCH` numérico (a loja da Apple não aceita
  sufixo).

## O que acontece no push na branch principal

1. Job de qualidade: o portão único.
2. Job de release: calcula a versão; se houver bump, atualiza manifestos e changelog, commita
   `chore(release): X.Y.Z [skip ci]`, cria a tag e a Release.
3. Deploy da web a partir do commit da tag.
4. Builds mobile com perfil de produção e envio automático às lojas, só se houve release. O job
   de build tem `if` próprio olhando apenas para o job que resolve o perfil, porque um job sem `if`
   herda o skip de qualquer job anterior na cadeia.

Push na branch de desenvolvimento roda o portão e publica a web de homologação. Build mobile de
homologação é manual, por `workflow_dispatch` com o perfil correspondente; o app resultante aparece
no aparelho com outro nome e aponta para o backend de homologação.

Um job comenta na PR a **prévia da versão** que o merge vai gerar (`scripts/release-preview.mjs`).
Dentro de uma PR o ref é `refs/pull/N/merge`; o script ignora as variáveis de CI que descrevem o
ref e usa o branch do checkout.

## Perfis de build (EAS ou equivalente)

| Perfil        | Ambiente de variáveis | Nome no aparelho | Destino                                |
| ------------- | --------------------- | ---------------- | -------------------------------------- |
| `development` | local (`.env`)        | padrão           | dev client                             |
| `stage`       | homologação           | "<App> Stage"    | TestFlight / trilha interna            |
| `production`  | produção              | padrão           | TestFlight → loja / trilha de produção |

O nome exibido muda por `CFBundleDisplayName` (iOS) e `app_name` (Android) via config plugin,
lendo o perfil de build do ambiente. Não troque o `name` do app: isso renomeia o alvo do Xcode.

Depois de cada release, a branch principal volta para a de desenvolvimento (fast-forward). Sem
isso, o próximo build de homologação sai com a versão anterior, e a loja recusa versão já fechada.

## Supply chain

- Actions pinadas por SHA; `permissions:` mínimo por job (`contents: read` por padrão).
- `npm ci`, nunca `npm install`, em CI.
- `scripts/audit.js`: falha só em `high`/`critical` fora de uma allowlist documentada em
  `docs/security-vulnerabilities.md`; ignora cópias que vivem apenas nas dependências empacotadas
  do CLI do npm. Adicionar item à allowlist é decisão, não conserto.
- Pre-commit (husky + lint-staged) roda lint e formatação só no que está staged.
- O job de release usa o token do próprio workflow com `contents: write`; nenhum token pessoal.

## Checklist de um deploy de produção

1. Migrações e funções serverless aplicadas em produção **antes** do merge, quando o app novo
   depende delas (texto legal com versão nova é o caso clássico: sem a migração, nenhum usuário
   consegue aceitar).
2. PR com a prévia de versão conferida; merge com merge commit.
3. Acompanhar: qualidade → release → web → builds. Anotar os números de build por plataforma.
4. Back-merge da principal para a de desenvolvimento.
5. Enviar à análise o build de produção, não o de homologação.
