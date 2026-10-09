# Servidores MCP

`mcp.json` vai para a raiz do projeto como `.mcp.json`, versionado, para que quem clonar tenha o
mesmo conjunto. Remova o que a stack não usa.

| Servidor              | Para quê                                                                                              | Quando vale a pena                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `git`                 | Operações de git como ferramentas tipadas (status, diff, log, blame)                                  | Sempre                                                                          |
| `memory`              | Grafo de entidades e relações, complementar à memória por arquivos                                    | Projetos com muitos atores e sistemas                                           |
| `sequential-thinking` | Raciocínio em etapas revisáveis                                                                       | Problemas com muitas dependências                                               |
| `playwright`          | Navegador controlado pelo agente: abrir a web, snapshot de acessibilidade, clicar, ler console e rede | Qualquer projeto com interface web; verificar deploy e reproduzir bug de layout |
| `codegraphcontext`    | Grafo de código: chamadores, código morto, complexidade, impacto de uma mudança                       | Bases com mais de algumas dezenas de módulos                                    |
| `tree-sitter`         | Consultas sintáticas por linguagem                                                                    | Refatorações estruturais                                                        |
| `papo`                | Agentes de máquinas diferentes conversando direto                                                     | Contrato cruza repositórios de times diferentes; ver `papo.md`                  |

Dois servidores entram por outro caminho:

- O MCP do provedor de backend (Supabase e similares) quando o projeto o usa: registre por
  `claude mcp add`, com o token no ambiente, nunca no `.mcp.json` versionado.
- O `papo` é registrado no escopo local (`claude mcp add --scope local papo -- <caminho> mcp`),
  porque o binário e a identidade são da máquina, não do projeto.

## Lições de setup no Windows

- `codegraphcontext` não precisa de um banco de grafos externo; o backend embutido (kuzu) basta.
  Instalar o Neo4j foi tempo perdido.
- `mcp-server-tree-sitter` exige o SDK de MCP em versão `<2`; com a mais nova, falha ao subir.
- O servidor de Playwright responde ao handshake antes de o navegador estar pronto. A primeira
  chamada pode falhar sem que o servidor esteja fora: repita uma vez antes de diagnosticar.
- O `cgc` precisa estar no `PATH` do shell que o Claude Code usa (no Windows, o do usuário, não só
  o do terminal onde foi instalado).
- `claude mcp list` mostra o estado de cada servidor; é a primeira coisa a rodar quando uma
  ferramenta "sumiu".
