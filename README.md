# claude-dev-standards

Kit de padrões para desenvolver com o Claude Code (e com o Cursor) em qualquer projeto: o contrato
do projeto (`CLAUDE.md`), agentes especializados, hooks e permissões, regras de código impostas por
lint, estratégia de testes, versionamento e release, fluxo de tarefa com GitHub Projects, wiki
atualizado pelo CI a cada release, servidores MCP, comunicação entre agentes de projetos diferentes
e uma skill de relatórios de proteção de dados e engenharia.

Nasceu de um app Expo (iOS, Android e web) com Supabase e integração com um sistema externo,
construído por um desenvolvedor com o Claude Code como par permanente. Tudo aqui foi anonimizado:
não há nome de produto, de empresa, de ambiente nem regra de negócio.

## Como aplicar a um projeto

Cole no Claude Code, dentro do projeto que vai receber as regras:

> Aplique os padrões de https://github.com/joaovic135/claude-dev-standards a este projeto,
> seguindo o arquivo `APLICAR.md` desse repositório.

O agente clona o kit numa pasta temporária, lê `APLICAR.md` e faz o resto: copia e **adapta** (nunca
linka) o que faz sentido para a stack do projeto, pergunta o que não dá para deduzir, e registra no
`CLAUDE.md` do projeto o que foi adotado.

Para o Cursor, copie `cursor/rules/*.mdc` para `.cursor/rules/` do projeto.

## Mapa

| Pasta                                                          | O que tem                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `APLICAR.md`                                                   | Instruções passo a passo para o agente aplicar o kit a um projeto                                      |
| `claude/CLAUDE.template.md`                                    | Modelo do `CLAUDE.md`, com as nove seções e placeholders                                               |
| `claude/agents/`                                               | 12 agentes: desenho, revisão, banco, segurança, testes, UX, aparelho, contexto, plano de testes        |
| `claude/settings.json`, `claude/hooks/`, `claude/claudeignore` | Hook de formatação pós-edição, lista de negação de leitura, ignore de busca                            |
| `claude/memoria.md`                                            | Convenção da memória persistente do agente                                                             |
| `claude/skills/fluxo-de-tarefa/`                               | Skill de projeto que abre e conduz cada tarefa: issue, branch ligada, worktree, PR em rascunho, card   |
| `rules/codigo.md`                                              | Invariantes, fronteiras, convenções e como registrar um padrão novo                                    |
| `rules/decisoes-de-arquitetura.md`                             | Escada "onde uma capacidade mora", critérios de corte e decisões com trade-off                         |
| `rules/testes.md`                                              | Quando escrever teste, níveis, plano executável por agente                                             |
| `rules/release.md`                                             | Conventional Commits, `semantic-release`, portão único, CI, supply chain, lições                       |
| `rules/fluxo-de-trabalho.md`                                   | Tutorial do fluxo de tarefa com GitHub Projects: quadro, ciclo, campos, Action, tokens, armadilhas     |
| `rules/wiki-automatica.md`                                     | Tutorial do wiki do GitHub atualizado pelo Claude Code no CI a cada release                            |
| `rules/ci/`                                                    | Modelos de CI: `semantic-release`, pré-commit, Action do quadro, workflow e prompt do wiki             |
| `rules/mobile.md`                                              | Armadilhas de Expo / React Native que já custaram uma sessão                                           |
| `rules/eslint/`                                                | Regras de lint que impõem tokens de design, fronteiras entre features e shims de SDK                   |
| `scripts/`                                                     | Gate de auditoria, prévia de release, tipos, versão única, branch ligada à issue e contexto do wiki    |
| `cursor/rules/`                                                | Regras `.mdc` para o Cursor: clean code, SOLID, hooks, estrutura de rotas e o resumo do contrato       |
| `mcp/`                                                         | Servidores MCP recomendados, lições de setup e o `papo` para agentes de projetos diferentes            |
| `skills/`                                                      | A skill `relatorios-lgpd-engenharia`, como pasta e como pacote `.skill`                                |
| `docs/`                                                        | Artigo "Construindo um app multiplataforma com Claude Code" (HTML e PDF), que explica o porquê de tudo |

## Princípios que atravessam o kit

- **Cada regra diz o que fazer, o problema que evita e onde é imposta** (lint, tipo, teste, CI, ou
  "convenção, sem imposição"). Regra sem imposição declarada é pedido, não contrato.
- **Imponha por máquina o que der.** Tokens de design, fronteiras e shims viram regras de ESLint;
  texto legal vira teste; dependências viram gate de CI; autorização vira policy no banco.
- **Cada agente tem um papel e uma negativa.** "Não use para X; isso é do agente Y" evita mais
  erros do que a lista de capacidades.
- **O porquê vai no commit, não no código.** Sem comentários no código; o histórico do git é o
  registro de decisões.
- **Registre a armadilha no mesmo dia** em que ela custou tempo, no mesmo commit que a corrige.
- **Copiar e adaptar, nunca linkar.** Cada projeto diverge do kit por motivos próprios; o kit é
  ponto de partida, não dependência.

## Licença

MIT. A skill e o artigo em `docs/` são do autor do repositório; as ferramentas citadas são de seus
respectivos autores.
