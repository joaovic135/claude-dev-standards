# Trilha de engenharia

Inventário que alimenta o Volume II. O Volume II é ao mesmo tempo documento de engenharia e guia de
boas práticas, então cada dossiê precisa de duas coisas: **números exatos** (copiados das fontes, sem
arredondar nem estimar) e **o porquê** de cada prática, com o exemplo do repositório.

Seis frentes independentes, em paralelo. Todas leem `rel/contexto.md` primeiro e terminam com um
resumo de até 200 palavras com os principais números e o caminho do arquivo gravado. Nenhuma deixa
arquivo novo no repositório.

## Sumário

1. testes-catalogo — todos os testes, com nomes
2. resultados — plano de testes e o que ele provou
3. arquitetura — camadas, invariantes, regras e onde são impostas
4. processo — fluxo de trabalho, histórico do git, IA no desenvolvimento
5. ia-produto — IA dentro do sistema, do ponto de vista de engenharia
6. design — sistema de design, acessibilidade e auditorias de UX anteriores
7. Formato de `rel/testes.json`

## 1. testes-catalogo

Catalogue **todos** os testes automatizados e scripts de teste, com o nome de cada teste.

**Antes de rodar qualquer teste:** testes de integração e fixtures costumam criar e apagar tabelas, e
a configuração do projeto pode apontar para um banco real. Descubra para qual banco a suíte aponta
(leia a configuração de teste, não o `.env`; mostre só host e nome), force a instância descartável
do contexto pela variável de ambiente no próprio comando e, na dúvida, **não rode**: liste os testes
sem executar (`--collect-only`, `--list`, `--listTests`) e registre que não foram executados. Testes
puramente unitários, sem banco nem rede, podem rodar.

- **Unitários e de componente:** rode o executor com saída JSON gravada fora do repositório e extraia
  suíte, título completo, situação e duração.
  - Jest: `npx jest --json --outputFile=<rel>/jest.json`; cobertura com
    `--coverage --coverageReporters=json-summary --coverageDirectory=<rel>/coverage`.
  - Vitest: `npx vitest run --reporter=json --outputFile=<rel>/vitest.json`.
  - pytest: `pytest --junitxml=<rel>/pytest.xml` (ou `pytest-json-report`).
  - Go: `go test -json ./... > <rel>/go.json`. JUnit/Gradle: os XML de `build/test-results`.
- **Ponta a ponta:** liste specs e casos sem executar (`npx playwright test --list`, `npx cypress run
--spec` em modo listagem, ou leia os arquivos). Diferencie suítes funcionais, de segurança e de
  privacidade.
- **Scripts de teste** (sondas, carga, concorrência, verificação): objetivo, item do plano que
  atendem, ferramenta, como invocar.
- **Portões estáticos:** lint, typecheck, auditoria de dependências, hooks de pre-commit, CI — o que
  cada um barra.
- Grave `<rel>/testes.json` (formato na seção 7) e `<rel>/dossie-testes-catalogo.md` com totais,
  tabelas por área e a lista completa de nomes em apêndice.

O anexo do Volume II é gerado deste JSON por `scripts/gerar_anexo_testes.mjs`; por isso o JSON
precisa estar certo.

## 2. resultados

Digira o plano de testes e seus resultados num quadro fiel.

- Leia o plano e o registro de resultados inteiros. Para cada suíte e item: objetivo, método e
  ferramenta, situação real (passou, falhou, parcial, bloqueado, não executado), números-chave, achados
  e o item de backlog correspondente.
- Extraia os números para gráficos **exatamente como registrados**: matrizes de autorização (total,
  aprovados, desvios e o que são), carga (p95 por patamar de usuários, taxa de requisições, erros),
  concorrência (o que cada caso provou), desempenho de consulta (tempo, índices).
- Registre as **refutações que mudaram uma conclusão** e os **erros de processo** relatados. Um
  relatório de testes que só mostra sucesso não convence.
- Seja honesto sobre o que **não** foi executado.
- Se o projeto não tem plano de testes formal, reconstrua o que existe (CI, suítes, testes manuais
  documentados) e diga que não há plano.
- Grave `<rel>/dossie-resultados.md`: quadro geral por suíte, tabela de números, achados por gravidade
  com backlog, o que falta executar, linha do tempo da execução.

## 3. arquitetura

Documente a arquitetura e as regras de codificação **efetivamente aplicadas**.

- Fontes: instruções do projeto para pessoas e agentes (CLAUDE.md, AGENTS.md, CONTRIBUTING), config
  de lint (cada regra própria e o que impõe), config de tipos, manifesto de dependências, config da
  aplicação e do build, CI, hooks, scripts, estrutura de pastas, migrações (tabelas, regras de acesso,
  triggers, funções), funções de servidor (papel e autenticação), documentos de integração.
- Entregue:
  1. Camadas e direção de dependência, e como é imposta.
  2. Invariantes do projeto: para cada uma, o que diz, o problema que evita, onde é imposta (lint,
     tipo, teste, banco, CI, ou "convenção, sem imposição") e um arquivo de exemplo.
  3. Convenções (idioma, nomes, comentários, tipagem, tratamento de erro, relógio, SDKs de terceiros).
  4. Modelo de dados e segurança no banco; máquinas de estado e onde transições inválidas são
     rejeitadas.
  5. Integrações.
  6. Pipeline de entrega (commits, versionamento, jobs do CI na ordem, builds, deploy, portões).
  7. Números: linhas de código por área (`git ls-files | xargs wc -l` por pasta), telas, componentes,
     migrações, regras de acesso, funções; versões das dependências principais.
  8. Armadilhas registradas e o que ensinaram.
- **Sem regras escritas** (nenhum arquivo de instruções, lint padrão, sem portão no CI): descreva as
  convenções que o código de fato segue (com exemplos) e registre a ausência de regra escrita e de
  imposição como achado de qualidade, com recomendação. Não invente invariantes que o projeto não tem.
- Grave `<rel>/dossie-arquitetura.md`, com referências arquivo:linha.

## 4. processo

O processo de desenvolvimento e o uso de IA **no desenvolvimento** (a IA dentro do produto é a frente 5).

- Fontes: definições de agentes e configurações do assistente (`.claude/agents`, `.claude/settings.json`,
  hooks, permissões negadas), o arquivo de instruções do projeto como contrato entre pessoas e
  agentes, auditorias e backlogs, planos de teste escritos para execução por agente, revisões de
  código registradas, histórico do git.
- Do git: total de commits; por autor (agrupe só nomes iguais, sem inferir quem é quem); por mês; por
  tipo de commit convencional (feat, fix, test, docs, chore, refactor, outros) e aderência ao padrão;
  tags e versões; primeiro e último commit.
  ```bash
  git log --format='%ad %s' --date=format:%Y-%m | awk '{print $1}' | sort | uniq -c
  git log --format='%s' | sed -E 's/^([a-z]+)(\(.+\))?!?:.*/\1/;t;s/.*/fora-do-padrao/' | sort | uniq -c
  ```
- Descreva o fluxo **real** deste projeto, reconstruído do histórico e dos documentos, com exemplos
  concretos: práticas que deram resultado e falhas de processo documentadas, cada uma com a lição. Não
  parta de um fluxo idealizado. (Exemplo de como um projeto pode ser: auditoria → backlog com critério
  de pronto → execução por lotes → revisão por agentes → portão único → release automático.)
- Sem uso de IA no desenvolvimento: diga isso em uma frase e retire o capítulo correspondente do
  Volume II.
- Grave `<rel>/dossie-processo.md`.

## 5. ia-produto

IA dentro do sistema, vista pela engenharia (a dimensão `ia` da trilha LGPD olha a mesma coisa pela
proteção de dados).

- Arquitetura de cada uso: modelo e parâmetros reais, estrutura do prompt de sistema, base de
  conhecimento (arquivos, tamanho, temas), histórico, limites de entrada e saída, autenticação,
  tratamento de erro, custo e cota.
- Avaliações automatizadas (casos, critério, como rodar; **não rode** se custar chamadas pagas sem
  autorização: descreva).
- Decisões de desenho e lições (por que a chave fica no servidor; o que falta: cota, registro,
  avaliação contínua). Confira o fornecedor real no código: documentos costumam citar o antigo.
- Grave `<rel>/dossie-ia-produto.md`. Sem IA no produto: pule e remova o capítulo do Volume II.

## 6. design

Práticas de UX, sistema de design e acessibilidade já aplicadas (as avaliações de persona são da
trilha de UX; a chave `ux` dos argumentos do workflow liga ou desliga aquela trilha, não esta frente).

- Fontes: auditorias de UX anteriores (método e achados por situação), tokens de tema e modo escuro,
  regras de lint contra valores literais, componentes base, guias de plataforma, uso de rótulos de
  acessibilidade (meça: quantos componentes interativos têm rótulo), suporte a fonte dinâmica, testes
  de acessibilidade automatizados (existem? rodam?).
- Entregue princípios, como são impostos, números, o corrigido e o pendente, e as lacunas honestas.
- Grave `<rel>/dossie-design.md`. Sem esta frente, o capítulo de UX e design do Volume II sai.

## 7. Formato de `rel/testes.json`

```json
{
  "gerado_em": "05/10/2026",
  "revisao": "6ef6826",
  "suites": [
    {
      "tipo": "jest",
      "arquivo": "src/lib/__tests__/prazo.test.ts",
      "area": "lib",
      "camada": "lógica pura",
      "descricao": "Uma frase dizendo o que a suíte protege.",
      "total_testes": 2,
      "testes": [
        {
          "nome": "conta dias úteis ignorando feriado nacional",
          "situacao": "passed"
        },
        { "nome": "recusa prazo no passado", "situacao": "passed" }
      ]
    },
    {
      "tipo": "playwright",
      "arquivo": "e2e/login.spec.ts",
      "area": "e2e",
      "descricao": "Entrada, erro de senha e recuperação por código.",
      "versionado": true,
      "testes": [{ "nome": "login com senha errada mostra a mensagem certa" }]
    }
  ],
  "scripts": [
    {
      "arquivo": "scripts/testes/rls.mjs",
      "ferramenta": "Node",
      "suites_plano": ["S1"],
      "objetivo": "Matriz de acesso com o ator não autorizado em cada tabela protegida.",
      "invocacao": "node scripts/testes/rls.mjs"
    }
  ]
}
```

`tipo` é a ferramenta (jest, vitest, pytest, playwright, cypress, junit, xctest, go...). `situacao`
ausente conta como aprovado; qualquer valor diferente de `passed`/`passou` aparece no anexo.
