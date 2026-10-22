# Configuração do Claude Code

| Arquivo                   | Destino no projeto                | O que faz                                                                                                                                                                                           |
| ------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.template.md`      | `CLAUDE.md`                       | Contrato do projeto com nove seções; preencha os placeholders e apague o que não se aplica                                                                                                          |
| `agents/*.md`             | `.claude/agents/`                 | Doze agentes com papel, ferramentas mínimas, modelo e a negativa "não use para X"                                                                                                                   |
| `settings.json`           | `.claude/settings.json`           | Hook `PostToolUse` de formatação e `permissions.deny` para lockfiles, saídas de build e `.env*`                                                                                                     |
| `hooks/format-edited.sh`  | `.claude/hooks/`                  | Formata o arquivo recém-editado com o formatador do projeto; silencioso por contrato                                                                                                                |
| `claudeignore`            | `.claudeignore`                   | O que a busca do agente não vê: gerado, vendorado, binários                                                                                                                                         |
| `memoria.md`              | (leitura)                         | Convenção da memória persistente: tipos, formato, o que vale guardar                                                                                                                                |
| `skills/fluxo-de-tarefa/` | `.claude/skills/fluxo-de-tarefa/` | Skill de projeto do fluxo de tarefa com GitHub Projects; troque os placeholders `<org>`, `<repo>`, `<número do quadro>`, `<nome do quadro>` e `<produto>`. Tutorial em `rules/fluxo-de-trabalho.md` |

## Os agentes

| Agente                     | Decide ou executa                                                                                  | Negativa                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `architect`                | Desenho antes do código: onde mora, se vale abstrair, se uma fronteira move                        | Não revisa código escrito (`code-reviewer`); não desenha banco (`db-guardian`) |
| `code-reviewer`            | Revisa diff antes do commit: duplicação real, carga cognitiva, nomes, convenções                   | Não revisa SQL; não decide desenho                                             |
| `db-guardian`              | Escreve e revisa migrações, RLS, policies, gatilhos, funções e seus testes                         | Único que edita banco                                                          |
| `security-reviewer`        | Revisa mudança em auth, privilégio, segredos, dependências, CI                                     | Não revisa RLS; não revisa qualidade geral                                     |
| `test-writer`              | Decide o que merece teste e escreve o que falta                                                    | Não decide estratégia de plano (`architect-testes`)                            |
| `ux-auditor`               | Audita fluxos e copy contra heurísticas; escreve plano em lotes                                    | Não edita código                                                               |
| `ux-fixer`                 | Executa um lote do plano exatamente como escrito                                                   | Não decide nada; um agente por lote, em paralelo                               |
| `device-qa`                | Roda no aparelho, tira screenshot, lê o que diverge                                                | Não escreve código; não revisa diff                                            |
| `context-guard`            | Audita contexto e encolhe saídas                                                                   | —                                                                              |
| `architect-testes`         | Estratégia e dimensionamento de um plano de testes executável                                      | Não revisa código de teste; não desenha sondas                                 |
| `code-reviewer-testes`     | Executabilidade, determinismo, isolamento, ator não autorizado, seletores estáveis, limiares de k6 | Não decide estratégia; não desenha sondas                                      |
| `security-reviewer-testes` | Transforma o modelo de ameaças em sondas: RLS, IDOR, segredos no bundle, replay, purga, MASVS      | Não revisa qualidade de teste; não decide estratégia                           |

Modelo por papel: revisores e arquitetos no modelo mais capaz; o executor de lotes (`ux-fixer`)
num modelo mais barato, porque não decide. Ferramentas mínimas: revisores só leem.
