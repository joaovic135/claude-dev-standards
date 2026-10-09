# Trilha de experiência de uso

Três peças, nesta ordem: **catálogo de telas** (o que a pessoa vê, capturado de verdade), **avaliação
GenderMag** (Abi e Tim, as personas de facetas opostas) e **avaliação com persona de domínio** (o
usuário real do produto). Cada avaliação passa por um verificador que confere cada problema contra a
captura e o código, e uma consolidação produz os números e os documentos.

O catálogo vem primeiro porque um avaliador que só lê código avalia o que o código **pretende**, não o
que a pessoa **vê**. Sem capturas, a avaliação continua por leitura de código, mas a limitação é
declarada no relatório.

## Sumário

1. Catálogo de telas
2. GenderMag: o essencial do método
3. Personas personalizadas
4. Cenários
5. Prompt do percurso GenderMag
6. Persona de domínio
7. Verificação e consolidação
8. O que vai para o Volume II

## 1. Catálogo de telas

Saída: imagens `NN-area-estado.png` em `relatorios/telas/` e o manifesto `rel/catalogo/telas.json`:
lista de `{ id, arquivo, rota, titulo, descricao, tema, texto_visivel, controles, arquivos_fonte }`.
Depois do catálogo, copie as imagens para os volumes com
`python <skill>/scripts/preparar_volumes.py <relatorios> --telas <relatorios>/telas`.

Como capturar, conforme o projeto. Prefira rodar a captura **de fora do repositório** (uma pasta de
ferramentas em `<trabalho>/ferramentas`, com seu próprio Playwright em Node ou Python); só crie um
arquivo de teste dentro do repositório se o projeto já tiver E2E e o usuário concordar, e nesse caso
ele **se pula sozinho** sem uma variável (`E2E_CATALOGO`), para não entrar na suíte normal.

- **Interface web (SPA, renderizada no servidor, build web de app híbrido):** Playwright. Viewport
  do uso real: celular (390×844, `deviceScaleFactor: 2`, `isMobile`, `hasTouch`) para produto
  móvel; desktop (1440×900) para sistema de balcão ou escritório; os dois se o produto atende os
  dois. `locale: 'pt-BR'`.
- **App só nativo:** emulador ou aparelho com `adb exec-out screencap -p` (Android) ou
  `xcrun simctl io booted screenshot` (iOS), com roteiro de navegação (Maestro, Detox) ou manual.
- **Sistema sem interface própria (API):** pule o catálogo e a trilha de UX; o Volume II fica sem a
  Parte de experiência de uso.

Regras:

- **Dados fictícios, sempre**, numa instância **sem dado real**: a homologação, se ela só tiver dado
  sintético; senão, uma instância local descartável (banco vazio, migrações, semente fictícia). Antes
  de subir o sistema, confirme para qual banco ele aponta (host e nome) e force a instância
  descartável pela variável de ambiente no próprio comando. Crie usuários de demonstração com nomes
  fictícios plausíveis para o domínio, semeie dados variados (listas cheias e vazias, estados e prazos
  diferentes) e **apague tudo ao final** (ou descarte a instância), confirmando.
- Credencial de semente (chave privilegiada da homologação, senha do banco local): obtida em tempo
  de execução e exportada só no ambiente do comando, sem imprimir.
- Cubra, no mínimo: entrada (login vazio e com erro), recuperação de senha, cadastro e aceite de
  termos, onboarding, telas principais em cada estado (vazio, carregando quando possível, com dados,
  erro), fluxos de decisão do domínio (confirmações, cancelamentos), perfil e configurações,
  exclusão de conta, páginas públicas, e pelo menos quatro telas em tema escuro se houver.
- Para cada captura, grave também o texto visível (innerText, até 4.000 caracteres) e os controles
  com rótulos acessíveis.
- **Confira:** abra pelo menos oito imagens com Read e confirme que mostram a tela esperada, carregada,
  sem spinner nem tela em branco. Refaça as que falharem. Registre o que não deu para capturar e por
  quê.

## 2. GenderMag: o essencial do método

GenderMag (Burnett et al., 2016, _Interacting with Computers_ 28(6):760–787, DOI 10.1093/iwc/iwv046;
https://gendermag.org/) é um percurso cognitivo especializado que encontra, por inspeção, "bugs de
inclusividade" ligados a cinco facetas de estilo cognitivo.

Antes de avaliar, um agente deve montar `rel/gendermag-metodo.md` lendo o material oficial (site,
formulários v3, descrições das facetas de jun./2021, handout de práticas) e registrando URL e data
de acesso, separando o que leu no original do que veio de fonte secundária. O resumo abaixo foi
verificado em 05/10/2026 e serve de roteiro, não de substituto.

**As cinco facetas** (valores sempre relativos aos **pares** da pessoa):

| Faceta                      | Abi                                 | Pat                                   | Tim                                          |
| --------------------------- | ----------------------------------- | ------------------------------------- | -------------------------------------------- |
| Motivações                  | conclusão da tarefa                 | conclusão da tarefa                   | interesse em tecnologia                      |
| Processamento de informação | abrangente (lê antes, age em bloco) | abrangente                            | seletivo (segue a primeira opção promissora) |
| Autoeficácia com computador | baixa; tende a se culpar            | média                                 | alta; culpa o software                       |
| Atitude perante risco       | avessa                              | avessa                                | tolerante                                    |
| Estilo de aprendizagem      | por processo (passo a passo)        | experimentação deliberada e reflexiva | por experimentação (_tinkering_)             |

**Perguntas exatas (formulário v3):**

- Subobjetivo: "Will <persona> have formed this subgoal as a step to their overall goal?" — Sim /
  Talvez / Não, facetas usadas, por quê.
- Ação, antes (1a): "Will <persona> do this action? Why?" — trate na justificativa os dois aspectos
  (perceberia que a ação existe? decidiria executá-la?). Versões antigas: "Will <persona> know what to
  do at this step?".
- Ação, depois (1b): "If <persona> does the right thing, will they know that they did the right thing
  and is making progress toward their goal? Why?"

**Procedimento:** decompor o cenário na sequência ideal de subobjetivos (na cabeça do usuário) e ações
(na interface). Para cada subobjetivo, a pergunta do subobjetivo; para cada ação, nomeá-la sem
executar, responder 1a, executar, responder 1b. **Segue-se a sequência mesmo com resposta "Não"**,
supondo que a persona fez a coisa certa.

**O que é bug de inclusividade:** resposta Não ou Talvez **ligada a uma ou mais facetas** da persona.
Não/Talvez sem faceta é bug geral de usabilidade. O método não define severidade: se o relatório
atribuir prioridade, diga que é critério do avaliador. Medida opcional: perguntas com Não/Talvez
ligadas a faceta ÷ perguntas respondidas, por persona (mede passos com problema potencial, não
usuários afetados).

**Correção guiada pela faceta** ("Facets Drive Fixes"): a recomendação deve servir a toda a faixa da
faceta (um guia opcional ajuda quem aprende por processo sem atrapalhar quem experimenta).

**Cuidados que o relatório precisa respeitar:**

- As diferenças são estatísticas, não individuais. Nunca escreva "mulheres não conseguem…"; escreva
  "pessoas com [valor de faceta] podem…".
- Abi primeiro; Tim completa a varredura; Pat cobre o meio. Percorrer Abi e Tim (opostos) é uma
  escolha de custo legítima; diga que Pat foi descrita e não percorrida. Material de ensino oficial
  evita apresentar só Abi e Tim, então descreva as três.
- Limitações a declarar: método por inspeção, sem usuários reais; avaliador único e não humano (o
  método foi feito para equipes); build avaliada (web × nativa); dados sintéticos; avaliador não é do
  domínio; vale só para os cenários percorridos.

## 3. Personas personalizadas

Personalize **só** as partes permitidas pelo método: nome (variantes oficiais Abigail/Abishek,
Patricia/Patrick, Timothy/Timara), pronomes, idade, ocupação, local, um parágrafo de contexto pessoal
e um de formação. As facetas e os textos fixos não mudam. As três personas são **idênticas em tudo que
não é faceta**: mesma profissão, formação e experiência no domínio. Diferença extra precisa de suporte
empírico, não pode sugerir diferença de inteligência e deve ser coerente com as facetas.

Para um produto profissional, as três têm a profissão do usuário real (médicas peritas, contadores,
corretoras), com experiência comparável.

## 4. Cenários

De 5 a 8 cenários derivados do sistema real (rotas, telas, perfis), os mesmos para todas as personas
GenderMag. A lista abaixo é um ponto de partida, não um molde; descarte o que não existe no sistema:

1. Primeiro acesso (convite ou cadastro, senha, termos, dados obrigatórios, aprovação se houver).
2. A tarefa central do produto, sob pressão de prazo quando o domínio tem prazo.
3. Acompanhar algo em andamento.
4. Encontrar ou registrar algo novo.
5. Conferir dinheiro (pagamentos, honorários, faturas), se houver.
6. Resolver um problema sozinho (senha esquecida; pedir ajuda ao suporte).
7. Cuidar da própria conta (corrigir dado, reler termos, excluir e reativar), se houver autosserviço.
8. **Atender o pedido de um titular** (consultar, exportar, corrigir ou eliminar os dados de alguém),
   quando o sistema é operado por uma equipe sobre titulares que não o usam. É o cenário que liga a
   avaliação de uso ao Volume I.

Escreva cada cenário como objetivo do usuário, em uma frase, com os critérios de escolha registrados
(frequência, consequência de erro, novidade). Com mais de um perfil de usuário, diga qual perfil
executa cada cenário.

## 5. Prompt do percurso GenderMag

Um agente por persona (Abi e Tim, e Pat se o orçamento permitir):

```
Leia <rel>/contexto.md. Sua tarefa: conduzir o percurso cognitivo GenderMag do sistema no papel da
persona <nome>, seguindo estritamente <rel>/gendermag-metodo.md (leia inteiro antes: facetas,
perguntas, regras). Você é um avaliador aplicando o método, não a persona improvisando: a cada
resposta cite as facetas que a justificam.
Base: o catálogo <rel>/catalogo/telas.json e as capturas em <telas>. ABRA as imagens com Read a cada
passo: você avalia o que a persona vê, não o que o código pretende. Use o código-fonte das telas para
confirmar textos, estados de erro, vazio e carregamento, e para fluxos que só existem no aparelho
(push, permissões), que você avalia por leitura de código e declara como tal.
<cenários>
Para cada cenário: objetivo; subobjetivos e sequência ideal de ações a partir das telas reais; a
pergunta do subobjetivo; para cada ação as perguntas 1a e 1b. Respostas sim, não ou talvez, sempre com
o porquê e as facetas. Onde for não ou talvez, registre um bug com: id <PREFIXO>-nn, cenário, passo,
tela (id do catálogo), facetas, descrição do que acontece com esta persona, evidência (id da captura
e arquivo:linha), gravidade (alta: provavelmente não conclui ou erra com consequência; média: conclui
com esforço, dúvida ou insegurança relevantes; baixa: atrito menor — critério do avaliador, não do
método) e recomendação que resolva para esta persona sem prejudicar as outras.
Não invente elementos de interface: se não está na captura nem no código, não existe. Registre também
o que o sistema faz bem para esta persona.
Grave <rel>/gendermag-<chave>.md (ficha da persona; tabela de passos por cenário; bugs; pontos
positivos; números: passos avaliados, passos com problema, bugs por faceta e por gravidade) e devolva
o resultado estruturado (esquema BUGS).
```

## 6. Persona de domínio

O GenderMag vê estilo cognitivo; não vê o **domínio**. Uma persona do usuário real, com rotina,
vocabulário e preocupações da profissão, encontra o que o GenderMag não encontra: informação na ordem
errada para a decisão, linguagem do sistema em vez da do usuário, consequências não explicadas.

Construa a persona (fictícia) a partir do que o código e os documentos dizem sobre o usuário:
profissão e especialidade, tempo de experiência, volume de trabalho, aparelho e contexto de uso (uma
mão, entre compromissos, pouco tempo), vocabulário que domina e o que não domina, preocupações
(prazo, dinheiro, responsabilidade pessoal, sigilo, agenda), tolerância a jargão, quanto confia na
empresa e quanto quer conferir sozinha.

Lentes de avaliação, além do percurso passo a passo (sabe o que fazer? entende o que vê? sabe que deu
certo?):

1. A informação necessária para a decisão central está presente e **na ordem em que o profissional
   decide**?
2. A linguagem é a do usuário ou a do sistema?
3. Prazos e consequências estão explícitos (o que acontece se não responder; dá para desfazer)?
4. Dinheiro: fica claro quanto, quando e o que falta?
5. O sistema respeita o contexto de uso (pouco tempo, interrupção, tela bloqueada com dado sensível)?
6. Sigilo: o que aparece em notificação; o que a persona esperaria de proteção.
7. Confiança na IA, se houver: fica claro que é IA, o que sabe e não sabe, e quando falar com pessoa?
8. O que falta para o dia a dia e não está no sistema.

Cite a heurística de Nielsen aplicável quando couber. Prefixo dos problemas: `DOM-nn` (ou uma sigla da
profissão). Mesmo critério de gravidade e mesma regra de não inventar interface. Grave
`rel/persona-<chave>.md` (chave `dominio` quando há uma só).

**Mais de um perfil de usuário** (recepção e profissional; aluno e professor; cliente e atendente):
uma persona de domínio por perfil que executa tarefas diferentes, cada uma nos cenários do seu
perfil. No workflow, `personasDominio: ["recepcao", "fisioterapeuta"]`, com as fichas em
`rel/persona-<chave>-ficha.md`.

## 7. Verificação e consolidação

**Verificador** (um por avaliação):

```
Leia <rel>/contexto.md. Você é o verificador independente da avaliação "<rótulo>", em <arquivo>.
Para CADA problema abaixo, confira na fonte se o elemento, o texto ou o comportamento descrito existe
(abra a captura e o arquivo de código citado). Marque confirmado, corrigido (reescreva o impreciso) ou
refutado (não existe, o texto é outro, o fluxo não é esse). Avalie se a gravidade condiz com a
consequência para a tarefa. Corrija o relatório no próprio arquivo, acrescente "## Verificação
independente" e devolva a lista final de problemas válidos no mesmo formato.
<JSON dos problemas>
```

**Consolidação** (um agente):

- Bugs unificados: o mesmo problema visto por mais de uma persona vira um item com as personas
  afetadas, ordenado por gravidade, com faceta, tela, evidência e recomendação.
- Contraste Abi × Tim: onde o sistema favorece um estilo e penaliza o outro.
- Números para os gráficos: totais por persona, por gravidade, por faceta, por cenário; passos
  avaliados e passos com problema por cenário e persona.
- Os dez problemas mais importantes do conjunto, cada um com a captura que melhor o ilustra.
- Não inventa problema novo.

Saídas: `rel/ux-consolidado.md` e, se o usuário quiser, documentos no `docs/` do repositório
(`avaliacao-gendermag-<data>.md`, `avaliacao-persona-<data>.md`) no estilo dos docs existentes.

**Esquema BUGS** (saída estruturada):

```js
const BUGS = {
  type: "object",
  properties: {
    resumo: { type: "string" },
    arquivo: { type: "string" },
    passos_avaliados: { type: "number" },
    passos_com_problema: { type: "number" },
    bugs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          cenario: { type: "string" },
          passo: { type: "string" },
          tela: { type: "string" },
          facetas: { type: "string" },
          descricao: { type: "string" },
          evidencia: { type: "string" },
          gravidade: { type: "string", enum: ["alta", "media", "baixa"] },
          recomendacao: { type: "string" },
        },
        required: [
          "id",
          "cenario",
          "passo",
          "descricao",
          "evidencia",
          "gravidade",
          "recomendacao",
        ],
      },
    },
  },
  required: [
    "resumo",
    "arquivo",
    "passos_avaliados",
    "passos_com_problema",
    "bugs",
  ],
};
```

## 8. O que vai para o Volume II

- Capítulo GenderMag: método com referências e as facetas; as personas; os cenários; resultados em
  quadro e nos gráficos (bugs por faceta; passos com problema por cenário); bugs unificados com
  capturas das telas mais citadas; contraste Abi × Tim; pontos fortes; limitações.
- Capítulo persona de domínio: a persona; os cenários; as lentes; problemas por gravidade com
  evidência e recomendação; capturas; pontos fortes; limitações.
- No Volume I, só as capturas que ilustram achados de LGPD (tela do termo, tela de exclusão,
  notificação com dado sensível), sempre com a legenda dizendo que os dados são fictícios.
