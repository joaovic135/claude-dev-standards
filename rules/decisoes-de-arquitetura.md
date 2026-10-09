# Como as decisões de arquitetura são tomadas

Não há diretório de ADRs. Há algo mais barato e mais usado: uma escada de onde uma capacidade
mora, três critérios de corte e o hábito de escrever o porquê na mensagem de commit. O artigo em
`docs/` elabora cada ponto com os casos reais; este arquivo é o resumo operacional.

## A escada: desça um nível só quando o de cima genuinamente não serve

1. **Banco**, se é invariante que vale para todo cliente da API: unicidade, transição de estado,
   autorização, agregado materializado.
2. **Lógica pura** (`features/*/utils`, `data`), se é regra de negócio testável sem rede nem
   storage.
3. **Camada de acesso** (`services`, cliente da API externa), se é query, mapeamento ou tradução
   de erro.
4. **Tela**, se é apresentação, navegação ou estado local.

A pergunta que a escada força: "se outro cliente (um script, um painel, uma função agendada) tocar
nesse dado, a regra ainda vale?" Se sim, a regra é do banco.

## Três critérios de corte

- **YAGNI ganha por padrão.** Duas ocorrências não justificam abstração; três em contextos
  genuinamente idênticos, sim. Contexto diferente não é duplicação: não unifique código que só
  parece igual hoje e vai divergir amanhã por motivos não relacionados.
- **Estado inválido irrepresentável** vence validação espalhada. Uma união discriminada de estados
  faz o compilador cobrar cada caso em vez de depender de um `if` por tela.
- **Se entender um desenho novo exige abrir mais de dois arquivos, o desenho perdeu**, mesmo
  estando tecnicamente correto.

## Decisões de referência e seus trade-offs

| Decisão                                                                          | Alternativa descartada                 | Custo aceito                                                                                              | Ganho                                                                     |
| -------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Autorização por RLS no banco                                                     | Filtrar por usuário nas queries do app | Toda tabela nova precisa de policy e de teste do ator não autorizado; "retorna zero linhas" em vez de 403 | Cliente novo não consegue esquecer o filtro                               |
| Segredos só em funções serverless; gatilhos leem do cofre                        | Chave privilegiada no DDL do gatilho   | Um passo a mais no provisionamento                                                                        | Dump do esquema deixa de ser vazamento                                    |
| Hora do servidor por RPC em plpgsql                                              | Função SQL pura                        | Nenhum                                                                                                    | SQL puro era inlinado e um plano preparado pulava a checagem de permissão |
| Rota única de resposta ao sistema externo, transição validada onde o estado mora | Uma rota por ação                      | Aceitar por um tempo uma transição que o operador do outro sistema faz fora do prazo                      | Contrato único e transições rejeitadas num lugar só                       |
| Texto legal com versão + hash + tabela só de inserção                            | Flag booleana de "aceitou" no perfil   | Ritual a cada mudança de texto: nova versão, migração antes do deploy, todos aceitam de novo              | Prova do que foi aceito, com data e hash                                  |
| Shim para SDKs nativos                                                           | Importar o SDK onde é usado            | Manter a superfície do shim                                                                               | Bundle web limpo; Jest sem mock por SDK                                   |
| Porta única de monitoramento                                                     | Chamar PostHog/Sentry direto           | Uma função a mais                                                                                         | Um destino consistente; `catch` não vira chamada de SDK                   |
| Navegação nativa com dois layouts (nativo e web)                                 | Um layout JS para tudo                 | Rota nova entra nos dois arquivos; o bundler não avisa                                                    | Gestos, grandes títulos e efeito nativo                                   |
| Cache persistido com limpeza no logout                                           | Cache sem limpeza                      | Hook de "ainda restaurando" para não renderizar cache alheio                                              | Abre rápido sem rede; nunca vaza entre usuários do mesmo aparelho         |
| Gate de audit com allowlist documentada                                          | `npm audit` cru                        | Justificar cada item da allowlist                                                                         | CI não bloqueia por vulnerabilidade sem correção; bloqueia pelas que têm  |
| O porquê no commit, não no código                                                | Comentários e ADRs                     | Disciplina na mensagem de commit                                                                          | Registro pesquisável que nunca envelhece em relação ao código             |

## Decisões que o pipeline de release ensinou

- **Back-merge após cada release.** A versão só sobe na branch principal; um build de homologação
  gerado da branch de desenvolvimento saía com a versão anterior e a loja o recusava, porque aquela
  versão já estava fechada. A principal volta para a de desenvolvimento depois de cada release
  (fast-forward, sem commit).
- **Nome exibido, não nome do projeto.** Trocar o `name` do app por perfil de build renomeia o alvo
  do Xcode e quebra a atribuição do perfil de provisionamento. Mude só `CFBundleDisplayName` (iOS)
  e `app_name` (Android) por config plugin, lendo o perfil de build do ambiente.
- **Jobs que herdam o skip.** No GitHub Actions, job sem `if` próprio é pulado quando qualquer job
  anterior na cadeia foi pulado. Cada job de build ganha um `if` que olha só para o job de que
  depende de verdade.
- **Prévia de versão numa PR.** Dentro de uma PR o ref é `refs/pull/N/merge`; o `semantic-release`
  em dry-run acha que não está na branch de publicação. O script ignora as variáveis de CI que
  descrevem o ref e usa o branch do checkout.
