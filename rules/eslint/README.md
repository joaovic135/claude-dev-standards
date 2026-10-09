# Regras de lint que impõem o contrato

`eslint.config.js` é um flat config de referência (ESLint 9) com quatro famílias de regra. Copie
para a raiz do projeto, ajuste o bloco `CAMINHOS` e as listas `SDKS_NATIVOS`, `SHIMS_DE_MONITORAMENTO`
e `PALETA_CRUA`, e troque `eslint-config-expo/flat` pela base da sua stack.

| Família                      | Regra                                                          | O que barra                                                                                            |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Design tokens                | `no-restricted-syntax` com seletores de AST                    | Literais hex/rgb/hsl, template strings com hex e `fontSize: <número>` em telas, componentes e features |
| Paleta crua                  | `no-restricted-imports` com `importNames`                      | Importar as paletas diretas fora da pasta de tema; o resto do app usa o hook de estilos temáticos      |
| Shim de SDK nativo           | `no-restricted-imports` por pacote, fora de `src/lib`          | Importar o SDK direto; só o shim pode                                                                  |
| Porta única de monitoramento | `no-restricted-syntax` + `no-restricted-imports`               | Chamar o SDK de erros direto ou importar o shim de crash fora de `src/lib`                             |
| Fronteira entre features     | Um bloco por pasta de `src/features`, gerado em tempo de carga | Importar `@/features/<outra>` de dentro de uma feature                                                 |

Decisões embutidas:

- As regras de token e de SDK são `error`. A de fronteira entra como `warn` quando o projeto já
  viola a regra: a lista de avisos é a dívida visível, e o plano é virar `error` quando zerar.
- Toda mensagem aponta para a seção do `CLAUDE.md` que explica a regra. O agente lê a mensagem
  do lint e sabe onde está o porquê.
- A lista de features é lida do disco, então uma feature nova ganha a regra sem editar o config.

Teste de contraste da paleta (par de tokens × razão mínima) fica no Jest, não no lint: é
`src/theme/__tests__/palette.test.ts` no projeto de origem. O lint garante que ninguém foge dos
tokens; o teste garante que os tokens prestam.
