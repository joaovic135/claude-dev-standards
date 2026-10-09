# Regras de código

Cada regra abaixo tem quatro partes: o que fazer, o problema que evita, onde é imposta e um
exemplo. Esse é o formato de todo registro no `CLAUDE.md` de um projeto. Regra sem "onde é
imposta" é pedido; com ele, é contrato.

## Invariantes

O que é caro demais para errar. Aqui "a gente conserta no próximo PR" não vale: quando der para
consertar, o dano (vazamento, registro perdido, prazo estourado) já aconteceu.

| Invariante                                                                             | Problema que evita                                                                | Imposição                                                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Toda tabela com dado de outro usuário tem autorização no banco por padrão (RLS)        | Um cliente novo (script, painel, função) esquece o filtro e lê tudo               | Policy no banco; teste do ator não autorizado por tabela                        |
| Credencial privilegiada vive só no servidor; variável pública de build é pública       | Segredo no bundle web servido estático ou no APK                                  | Revisão por agente de segurança; busca de segredos no bundle no plano de testes |
| Gatilho ou cron do banco lê URL e segredo de um cofre, nunca de literal no DDL         | A definição do gatilho aparece em todo dump e no painel                           | Convenção reforçada pelo agente de banco                                        |
| Autorização é no banco, não na tela                                                    | Botão escondido não é portão                                                      | Policy; teste do ator não autorizado                                            |
| A entidade central do domínio tem ciclo de vida explícito, validado onde o estado mora | Transição inválida aceita por uma tela que esqueceu a checagem                    | Trigger/RPC no banco; teste de transição válida e rejeitada                     |
| Valor do sistema de registro não é recalculado no cliente                              | Mostrar ao usuário um número que ninguém vai honrar                               | Convenção; teste do formatador                                                  |
| Timestamp vem do servidor                                                              | Prazo medido com relógio de aparelho errado                                       | RPC de hora do servidor; proibição de `Date.now()` em cálculo de prazo          |
| Nenhuma cor nem `fontSize` literal fora do tema                                        | Tema escuro quebrado; contraste fora da norma; estilo impossível de mudar em lote | ESLint `no-restricted-syntax` (ver `rules/eslint/`)                             |
| Migração aplicada não se edita                                                         | Ambientes divergentes                                                             | Convenção; revisão                                                              |
| Action de CI presa a tag mutável                                                       | Supply chain                                                                      | Pinar por SHA; `permissions:` mínimo                                            |

## Fronteiras

Direção de dependência, do mais estável para o mais volátil. Uma camada só importa das que estão
abaixo dela.

```
lib, theme, constants, types          não conhecem features nem telas
        ▲
data, features/*/utils                lógica pura, testável sem rede
        ▲
features/*/services, contexts         falam com o backend e com o sistema externo
        ▲
app/**, components/**                 telas e UI
```

- Feature não importa de feature. O que duas precisam sobe para `lib`, `components/ui` ou `data`.
  Imposto por `no-restricted-imports` com um padrão por feature (ver `rules/eslint/`). Se o
  projeto já viola a regra, entre com `warn`: a lista de avisos é a dívida visível, e só diminui.
- `features/*/utils` é lógica pura: sem cliente de banco, sem `fetch`, sem React. É o recorte sob
  cobertura.
- Tela não chama o cliente do banco; só `services` e `contexts`.
- `eslint-disable` numa regra de fronteira significa que a fronteira está errada.

## Convenções

| Regra                                                                                                                                       | Problema que evita                                                        | Imposição                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Produto no idioma do usuário; identificadores em inglês ou no termo de domínio já usado                                                     | Copy misturada; terceira convenção de nomes por arquivo                   | Convenção; revisão                                                                                   |
| Nenhum comentário no código; o porquê vai no commit ou no PR                                                                                | Comentário que envelhece e mente; nome ruim escondido atrás de explicação | Convenção; revisão. Exceção: `comment on function` no DDL, porque o banco não tem mensagem de commit |
| Tipagem estrita; `any`, `!` e cast sem checagem só quando o sistema de tipos não expressa, com justificativa no commit                      | Erro de runtime que o compilador pegaria                                  | `tsc --noEmit` no CI                                                                                 |
| Um único lugar traduz erro de infra (código do banco, status HTTP) para o que o app entende                                                 | Erro cru na UI por quinze `catch`                                         | Módulo único; teste por código de erro                                                               |
| SDK nativo entra por shim (`<sdk>.ts` → `.web.ts` no-op; bundler escolhe `.native.ts`), inicializado por componente headless no layout raiz | Módulo nativo no bundle web e no Jest                                     | `no-restricted-imports` do pacote fora de `lib`                                                      |
| Erro capturado passa por uma porta única de monitoramento                                                                                   | Dois destinos divergentes; SDK chamado em todo `catch`                    | ESLint barra o SDK e o shim fora de `lib`                                                            |
| Texto legal com versão e SHA-256; banco só aceita versão cadastrada com o mesmo hash; aceites em tabela só de inserção                      | Usuário aparecendo como tendo aceitado texto que não viu                  | Teste texto × hash × migração; RPC rejeita hash divergente                                           |
| Função serverless chamada pelo app autentica com helper compartilhado                                                                       | Verificação de JWT divergente entre funções                               | Convenção, sem imposição                                                                             |
| Cache persistido é apagado no logout, antes de qualquer tela montar                                                                         | Segundo usuário do aparelho vê dado do primeiro                           | Teste do contexto de auth                                                                            |

## Registrando um padrão novo

Adotou um padrão? Escreva no mesmo commit que o introduz. Quatro partes: o que fazer, o problema
que evita, onde é imposto, um arquivo de exemplo.

- Automatize a imposição quando der: regras de token e de import viram ESLint, não lembrete em
  revisão.
- Aplique ao código existente no mesmo commit. Padrão que só vale para arquivo novo cria duas
  convenções.
- Quando o padrão mudar, atualize o registro. Registro velho é pior que nenhum, porque o agente
  confia nele.

Exemplo de registro completo, tirado de um caso real (Android com edge-to-edge escondendo conteúdo
preso à base da tela):

> **Qualquer coisa presa à base (campo de chat, rodapé de sheet, rodapé de tela) tira o padding
> inferior de `useBottomSafePadding(base)`, nunca de um número fixo.** Com edge-to-edge, o Android
> desenha o app sob a barra de navegação (~48 dp com três botões); padding fixo de 14–18 px deixa
> botão e campo embaixo dela. O hook soma a área segura real no Android e mantém o valor fixo no
> iOS. Imposto por convenção, sem regra de lint. Exemplos: `components/ui/BottomSheet.tsx`,
> `features/chat/components/ChatInputBar.tsx`. O Jest recebe o mock oficial da biblioteca no setup.
