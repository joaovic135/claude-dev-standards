# Instruções para o agente aplicar este kit a um projeto

Você está num projeto que vai receber os padrões deste repositório. Siga os passos em ordem. Onde
está escrito "pergunte", pergunte ao usuário com opções e uma recomendação; não invente stack,
ambiente nem nome.

O contrato é **copiar e adaptar**. Nunca referencie este repositório de dentro do projeto nem
instale nada dele como dependência: cada arquivo copiado passa a ser do projeto e pode divergir.

## 0. Descubra o projeto antes de copiar

1. Leia a raiz: `package.json` (ou equivalente), estrutura de pastas, CI existente, `CLAUDE.md` e
   `.cursor/rules` se existirem, lint e formatador configurados.
2. Identifique a stack em quatro eixos: cliente (web, mobile, ambos), backend (banco próprio,
   BaaS, serverless), sistema externo de registro (há um ERP/API de terceiro que é fonte de
   verdade?), e entrega (lojas, hospedagem estática, container).
3. Pergunte o que não dá para deduzir: há dois ambientes (homologação e produção)? Quem é o time
   do backend/ERP (mesmo repositório ou outro)? Há textos legais com aceite do usuário? Há regra
   de design tokens ou tema?
4. Se já existe um `CLAUDE.md`, você vai **mesclar**, não substituir. Preserve o que o projeto já
   registrou; acrescente as seções que faltam.

## 1. O `CLAUDE.md`

Use `claude/CLAUDE.template.md` como esqueleto. Preencha cada placeholder com o que descobriu no
passo 0 e **apague as seções que não se aplicam** (por exemplo, "A tab bar tem dois layouts" num
projeto web-only). Regras de ouro ao preencher:

- Só entra no `CLAUDE.md` o que é caro demais para errar ou o que o agente não deduz do código.
  Estrutura de pastas e histórico não entram.
- Toda regra leva "onde é imposta". Se ainda não é imposta por nada, escreva "convenção, sem
  imposição" e abra um item para automatizar.
- Produto no idioma do usuário final; identificadores em inglês ou no termo de domínio já usado.
- Nenhum comentário no código: o porquê vai no commit. Se o projeto tem comentários hoje, não
  apague em massa; adote a regra para código novo **e** registre a dívida.

## 2. Agentes

Copie `claude/agents/*.md` para `.claude/agents/` do projeto. Depois:

- Remova os que não fazem sentido para a stack (`device-qa` num projeto sem app; `db-guardian`
  sem banco próprio).
- Ajuste em cada um os caminhos citados (`src/features`, `supabase/`, nome do plano de testes).
- Mantenha as frases "Do NOT use for X; that's `Y`". Elas são o roteamento entre agentes.
- Se o projeto usa outro modelo padrão, ajuste `model:` por papel: revisores e arquiteto no modelo
  mais capaz; executores de lote (como `ux-fixer`) num modelo mais barato.

## 3. Hooks, permissões e ignore

- Copie `claude/settings.json` para `.claude/settings.json` (mescle se já existir) e
  `claude/hooks/format-edited.sh` para `.claude/hooks/`. Ajuste o hook ao formatador do projeto
  (Prettier, Biome, Black, gofmt); o contrato é: formata o arquivo editado, é silencioso, nunca
  interrompe o agente.
- Copie `claude/claudeignore` para `.claudeignore` e acrescente o que o projeto gera (`dist/`,
  `build/`, `coverage/`, diretórios nativos, dumps).
- Em `permissions.deny`, mantenha lockfiles, `node_modules`, saídas de build e `.env*`.

## 4. Regras de código e lint

- Leia `rules/codigo.md` e traga para o `CLAUDE.md` as invariantes que se aplicam, adaptadas ao
  vocabulário do projeto.
- Se o projeto tem tema/design tokens, aplique `rules/eslint/` (sem cor nem `fontSize` literal
  fora da pasta de tema; paleta crua só dentro do tema; feature não importa de feature; SDK nativo
  só por shim). Ajuste os caminhos e as mensagens. Aplique ao código existente no mesmo commit;
  se a dívida for grande, entre com `warn` e registre o plano para virar `error`.
- Confirme que lint, typecheck e testes rodam num comando único (`npm run build` ou equivalente)
  e que o CI roda o mesmo comando.

## 5. Testes

Leia `rules/testes.md`. Registre no `CLAUDE.md` o recorte real de cobertura (o que é lógica pura e
está sob teste), quando escrever teste e quando não. Se o projeto tem autorização por papel ou
dono, garanta pelo menos um teste do ator **não** autorizado por regra. Se houver plano de testes
executável, copie os três agentes `*-testes` e ajuste o plano às suítes do projeto.

## 6. Versionamento e release

Leia `rules/release.md`. Decida com o usuário: Conventional Commits + `semantic-release` (copie
`rules/ci/releaserc.json` e `scripts/set-app-version.mjs`, ajustando os arquivos de versão) ou outro
esquema. Copie `scripts/audit.js` (gate de `npm audit` com allowlist documentada) e
`scripts/release-preview.mjs` (comentário na PR com a próxima versão) se for Node. Pine actions por
SHA e dê o mínimo de `permissions:` por job.

## 7. MCP e papo

Copie `mcp/mcp.json` para `.mcp.json` e remova os servidores que a stack não usa. Leia
`mcp/README.md` para as armadilhas de setup. Se o projeto conversa com outro repositório mantido
por outra pessoa (contrato de API, webhooks), proponha o `papo` (`mcp/papo.md`).

## 8. Cursor

Se o time usa Cursor, copie `cursor/rules/*.mdc` para `.cursor/rules/`. O arquivo
`regras-do-projeto.mdc` resume o contrato e deve ser mantido em sincronia com o `CLAUDE.md`.

## 9. Skills

A skill `skills/relatorios-lgpd-engenharia` é pessoal, não do projeto: instale em
`~/.claude/skills/` (ou importe o `.skill`) só se o usuário pedir relatório de proteção de dados ou
de engenharia.

## 10. Feche com um registro

No fim, escreva no `CLAUDE.md` do projeto (seção "Registrando um padrão novo") o que foi adotado,
o que ficou como convenção sem imposição e o que foi deixado de fora e por quê. Faça um único commit
`chore: adota padrões de desenvolvimento com agentes` descrevendo isso no corpo. Nada de
coautoria do agente no commit.
