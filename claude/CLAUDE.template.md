# <Nome do projeto> — regras do projeto

<Uma frase: o que é o produto, para quem, em qual plataforma. Uma segunda: backend e sistema
externo de registro, se houver. Uma terceira: onde é publicado.>

Regras de plataforma em [`docs/<plataforma>-rules.md`](docs/<plataforma>-rules.md).
Contrato do sistema externo em [`docs/integracao-<sistema>.md`](docs/integracao-<sistema>.md).
Privacidade e textos legais em [`docs/privacidade.md`](docs/privacidade.md).
Backlog técnico, com executor e critério de pronto por item, em [`docs/backlog.md`](docs/backlog.md).
Plano de testes executável pelo agente em [`docs/plano-de-testes.md`](docs/plano-de-testes.md);
resultados em `docs/plano-de-testes-resultados.md`.
Versionamento e release automáticos em [`docs/release.md`](docs/release.md): commit em
Conventional Commits (`feat:`/`fix:` geram versão; `chore:` não) e PR `<dev> → main` com merge commit.

## Comandos

```bash
<instalar>          # install (nunca `npm install` em CI; use `npm ci` ou equivalente)
<lint>
<typecheck>
<test>
<build>             # verificação completa: lint + typecheck + test + audit (+ build web, se houver)
```

Ordem e automação que já existem — não duplique:

- **O formatador já roda sozinho.** Há um hook `PostToolUse` em `.claude/settings.json` que formata
  todo arquivo editado, e um pre-commit que formata e linta o que está staged. Não chame o
  formatador na mão.
- **`<arquivo de tipos gerado>` é gerado** por `<comando>`. Aplique a migração antes de gerar os
  tipos, e gere os tipos antes de typecheckar.
- **`<build>` é o portão único.** Rode uma vez, no fim — não depois de cada edição.
- `scripts/audit.js` é o gate de auditoria de dependências com allowlist; falhas conhecidas e
  aceitas estão documentadas em `docs/security-vulnerabilities.md`. Adicionar item à allowlist é
  decisão, não conserto — justifique.

## Invariantes

O que é caro demais para errar — aqui "a gente conserta no próximo PR" não vale, porque quando der
pra consertar o dano já aconteceu.

1. **Toda tabela com dado de outro usuário é protegida por autorização no banco por padrão**
   (RLS ou equivalente), não por lembrar de filtrar na query. Tabela nova sem policy é bug de
   segurança, mesmo que nenhuma tela leia ela ainda.
2. **Credencial privilegiada vive só no servidor** (função serverless, backend). Qualquer variável
   pública de build entra no bundle e é pública. Se um segredo precisou virar pública, o desenho
   está errado. Gatilho ou cron do banco que chama função lê URL e segredo de um cofre, nunca de
   literal no DDL.
3. **Autorização é no banco, não na tela.** Esconder um botão é cortesia; o portão é a policy.
   Toda regra de acesso com caso não-trivial (dono, estado, papel) precisa de teste do ator
   **não** autorizado.
4. **A entidade central do domínio tem ciclo de vida explícito.** Transições inválidas são
   rejeitadas onde o estado mora, não só onde a tela chama.
5. **Valor que vem do sistema de registro não é recalculado no cliente.** O cliente formata; nunca
   arredonda, soma ou infere.
6. **Timestamp vem do servidor, nunca do relógio do aparelho.** Prazo medido com hora local é
   prazo errado.
7. **Nenhuma cor, nenhum `fontSize` literal** fora da pasta de tema — o ESLint barra. Falta um
   token? Adicione o token antes, não uma exceção depois.
8. **Migração aplicada não se edita.** Corrige-se com uma nova.
9. **Action de CI presa a tag mutável é buraco de supply chain.** Pinar por SHA e dar ao workflow
   o mínimo de `permissions:`.

## Registrando um padrão novo

**Adotou um padrão? Escreva no mesmo commit que o introduz.** Sem registro, ele sobrevive até a
próxima pessoa abrir o arquivo e escolher outra coisa — aí são dois jeitos de fazer a mesma coisa.

Um registro precisa de quatro coisas: o que fazer, o problema que evita, onde é imposto (regra de
lint, tipo, teste, CI — ou "convenção, sem imposição") e um arquivo de exemplo.

Automatize a imposição quando der. Aplique o padrão ao código existente no mesmo commit — padrão
que só vale para arquivo novo cria duas convenções em vez de uma. Quando o padrão mudar, atualize o
registro: registro velho é pior que registro nenhum.

## Fronteiras

Direção de dependência, do mais estável para o mais volátil:

```
<lib>, <theme>, <constants>, <types>          (não conhecem features nem telas)
        ▲
<data>, <features/*/utils>                    (lógica pura, testável sem rede)
        ▲
<features/*/services>, <contexts>             (falam com o backend e com o sistema externo)
        ▲
<app/**>, <components/**>                     (telas e UI)
```

- Uma feature não importa de outra feature. O que duas features precisam sobe para `<lib>`,
  `<components/ui>` ou `<data>`.
- `<features/*/utils>` é lógica pura: sem cliente de banco, sem `fetch`, sem framework de UI. É o
  que está sob cobertura de teste.
- Só `services` e `contexts` falam com o backend. Tela não chama o cliente direto.
- `eslint-disable` numa regra de fronteira quer dizer que a fronteira está errada, não que a
  exceção está ok.

## Convenções

- **Produto é em <idioma>.** Copy de usuário, mensagens de erro visíveis e documentação em `docs/`.
  Identificadores de código, nomes de tabela/coluna e de arquivo são em inglês ou no termo de
  domínio já usado — siga o arquivo vizinho, não invente uma terceira convenção.
- **Não escreva comentários no código.** Se a intenção não está clara, o nome ou a estrutura é que
  precisam mudar. O porquê vai na mensagem de commit, no PR ou na resposta.
- Tipagem estrita, sem escapes. `any`, `!` não-nulo e cast sem checagem só quando o sistema de
  tipos genuinamente não expressa aquilo — e a justificativa vai no commit.
- Um único lugar traduz erro de infra (código do banco, status HTTP) para o que o resto do app
  entende. Erro cru não chega na UI por quinze `catch` diferentes.
- **SDK nativo de terceiro entra por shim em `<lib>`**: `<sdk>.ts` reexporta `<sdk>.web.ts`
  (no-op tipado) e o bundler escolhe `<sdk>.native.ts` no aparelho; quem inicializa é um componente
  headless no layout raiz, atrás de `Platform.OS !== 'web'`. Imposto por `no-restricted-imports`.
  Exceção registrada: SDK de crash inicializa no escopo do módulo, porque `useEffect` perderia
  crash de boot.
- **Erro capturado passa por uma porta única de monitoramento.** O lint barra chamar o SDK direto
  fora de `<lib>`. Não espalhe a captura em `catch` novos: ela é para erro que ninguém tratou.
- **Texto legal tem versão presa ao conteúdo.** Termo e aviso ficam em `<data>/`, com versão e
  impressão digital SHA-256; o banco só aceita aceite de versão cadastrada com o mesmo hash e grava
  cada aceite em tabela só de inserção. Imposto por teste (texto × hash × migração) e pela RPC.
- **Função serverless chamada pelo app autentica com o helper compartilhado**, nunca com cópia
  local. Convenção, sem imposição.

## Testes

Teste existe onde errar é caro; porcentagem de cobertura não é o objetivo. O recorte real está em
`<collectCoverageFrom ou equivalente>`.

**Escreva teste quando:** uma regra de autorização tem caso não-trivial — e teste o ator **não**
autorizado; uma transição de estado é adicionada — caso válido e caso rejeitado; um prazo ou
contagem é calculado; uma regra de negócio está duplicada de propósito entre app e banco — escreva o
teste que compara os dois mecanicamente.

**Não escreva teste para:** getter, mapeamento direto linha→DTO, ou o que o sistema de tipos já
garante.

## Armadilhas que este projeto já aprendeu

<Uma por linha, em negrito o gatilho e depois o que fazer. Cada uma custou pelo menos uma sessão.
Começa vazia; cresce no mesmo commit em que a armadilha é corrigida. Veja `rules/mobile.md` do kit
para as de Expo / React Native.>

## Desenho

Onde uma capacidade nova mora — desça um nível só quando o de cima genuinamente não serve:

1. **Banco**, se é invariante que vale para todo cliente da API: unicidade, transição de estado,
   autorização, agregado materializado.
2. **Lógica pura** (`<features/*/utils>`, `<data>`), se é regra de negócio testável sem rede nem
   storage.
3. **Camada de acesso** (`services`, cliente da API externa), se é query, mapeamento ou tradução
   de erro.
4. **Tela**, se é apresentação, navegação ou estado local.

- YAGNI ganha por padrão. Duas ocorrências não justificam abstração; três em contextos
  genuinamente idênticos, sim. Contexto diferente não é duplicação.
- Prefira estrutura de dados que torna estado inválido irrepresentável a validação espalhada.
- Se entender um desenho novo exige abrir mais de dois arquivos, o desenho perdeu, mesmo estando
  tecnicamente correto.

## Disciplina de contexto

- Leia o trecho, não o arquivo inteiro, quando só o trecho importa.
- Não leia arquivo gerado nem vendorado (lockfile, `dist/`, `node_modules/`, `coverage/`). O
  `.claudeignore` e o `permissions.deny` já barram a maioria.
- Não releia o que você acabou de editar.
- Busca ampla e aberta vai para um subagente que devolve uma conclusão, não uma pilha de arquivos.
- Não cole diff grande na resposta; diga o que mudou e onde.
- Rode a verificação completa uma vez, no fim, não a cada edição pequena.
- Saída grande de ferramenta (log de build, relatório de lint) entra resumida: contagem e tipos de
  falha, não as 500 linhas.
