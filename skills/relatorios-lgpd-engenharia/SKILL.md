---
name: relatorios-lgpd-engenharia
description: Produz, a partir do código-fonte, do banco e das páginas públicas de um sistema (app, site, API), dois relatórios formais em LaTeX/PDF prontos para impressão e Overleaf. Volume I é a análise de proteção de dados à luz da LGPD para advogado e consultoria jurídica (inventário, operadores, direitos, segurança, achados verificados e refutados, quesitos, plano de adequação). Volume II cobre engenharia, qualidade e testes (arquitetura, regras de codificação, catálogo de testes com nomes, resultados, GenderMag e persona de domínio, IA no desenvolvimento, guia prático). Use sempre que o usuário pedir relatório ou auditoria de LGPD, privacidade ou proteção de dados de um sistema, material técnico para advogado, DPO ou encarregado, relatório formal de testes, qualidade ou engenharia, documentação de métodos e boas práticas do projeto, avaliação GenderMag ou com persona, ou relatório técnico em LaTeX/Overleaf sobre um software, mesmo que peça só um volume ou só uma parte.
---

# Relatórios de LGPD e de engenharia a partir do próprio projeto

Esta skill transforma um repositório (e, com cuidado, o banco e as páginas públicas do sistema) em
dois documentos formais:

- **Volume I — Proteção de dados.** Para um advogado sênior que vai encaminhar a uma consultoria. Não
  dá parecer: descreve fatos com evidência conferível, aponta dispositivos "possivelmente
  relacionados" e formula quesitos. Sua força é a precisão: um único fato errado ou uma conformidade
  afirmada sem prova desacredita o documento inteiro, e todo o método existe para impedir isso.
- **Volume II — Engenharia, qualidade e testes.** Para engenheiros, e legível por gestores. Mostra
  como o sistema foi construído e verificado e funciona como guia de boas práticas: cada capítulo diz
  o quê, por quê, como foi aplicado, a evidência e a lição.

Entrega: dois PDFs, dois `.zip` para Overleaf e os papéis de trabalho (dossiês, refutações, registro
de achados em JSON), que sustentam qualquer afirmação se alguém pedir a prova.

O processo inteiro é longo e caro: a execução de referência (um app Expo com Supabase) usou cerca de
60 agentes de análise e 17 de redação, e gerou volumes de 256 e 164 páginas. Por isso a primeira
coisa é combinar o escopo com o usuário.

## Mapa dos arquivos da skill

| Arquivo                                     | Quando ler                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `references/metodo-lgpd.md`                 | Trilha LGPD: contexto, gravidade, dimensões, prompts, consolidação, consultas agregadas                                                                      |
| `references/base-legal.md`                  | Base jurídica verificada (inclui retrato da ANPD em 10/2026 e armadilhas de citação)                                                                         |
| `references/metodo-ux.md`                   | Catálogo de telas, GenderMag, persona de domínio                                                                                                             |
| `references/engenharia.md`                  | Inventário do Volume II e formato do `testes.json`                                                                                                           |
| `references/redacao.md`                     | Roteiro de cada capítulo, prompts de redator, diagramas e editores                                                                                           |
| `references/latex.md`                       | Instalação, identidade visual, componentes, compilação, Overleaf, armadilhas                                                                                 |
| `references/correcoes.md`                   | Se o usuário quiser corrigir achados antes de entregar                                                                                                       |
| `references/licoes.md`                      | O que deu errado na execução de referência; leia antes de orquestrar                                                                                         |
| `assets/workflows/analise.js`, `redacao.js` | Modelos de workflow multiagente, parametrizados por `args`                                                                                                   |
| `assets/latex/`                             | `relatorio.sty`, modelos dos dois volumes, diagramas, exemplo de componentes                                                                                 |
| `scripts/`                                  | `preparar_volumes.py`, `gerar_registro.mjs`, `gerar_anexo_testes.mjs`, `render_paginas.py`, `overfull.py`, `empacotar.py`, `limpar_lei.py`, `extrair_pdf.py` |

`<skill>` abaixo é a pasta onde este arquivo está.

## Passo 0 — Combinar com o usuário

Antes de qualquer análise, pergunte o que não dá para deduzir do repositório. Use a ferramenta de
perguntas, com opções e uma recomendação, quando existir. Não comece a gastar agentes sem isso.

1. **Volumes:** os dois, só o I (LGPD) ou só o II (engenharia).
2. **Quem pede e em que papel:** a própria empresa dona dos dados; um desenvolvedor contratado; um
   fornecedor de sistema usado por vários clientes (cada cliente é controlador dos próprios dados).
   Uma instalação ou várias? Isso muda os papéis de controlador e operador, a abertura e o capítulo 03.
3. **Identificação para capa e rodapé:** nome do produto; razão social, marca, CNPJ, cidade/UF;
   autor e cargo; destinatário de cada volume; classificação (Confidencial / Uso interno);
   encarregado designado, se houver. Se termo, site e lojas divergirem sobre a razão social, isso é
   achado; a versão da capa é decisão do usuário.
4. **Titulares:** quem usa o sistema (perfis com login) e de quem são os dados. O titular se cadastra
   e usa o sistema, ou o sistema é operado por uma equipe sobre titulares que não o acessam
   (pacientes, alunos, funcionários)? Há crianças? Convênios ou outros controladores no meio?
5. **Ambientes e acesso:** onde roda a produção; se existe homologação e se ela tem dado real (se
   tiver, vale como produção); como consultar a produção **só para leitura** sem expor credencial
   (papel somente leitura, CLI autenticada). Confirme que o usuário concorda com "produção: só
   agregados".
6. **O que pode rodar na máquina:** instalar TinyTeX, PyMuPDF e Playwright numa pasta fora do
   repositório; subir o sistema e rodar os testes contra uma **instância descartável** (banco local
   vazio com dados fictícios, ou homologação sem dado real).
7. **Documentos fora do código** que o advogado vai comparar: termo ou consentimento em papel, aviso
   de privacidade do site, contratos com fornecedores. Peça cópias, se o usuário quiser.
8. **Fora do escopo:** sistemas que não estão no repositório, operações humanas.
9. **Modo de execução** (custo), conforme a tabela abaixo, e se autoriza workflow multiagente.
10. **Onde entregar** e onde guardar os papéis de trabalho de forma permanente.

| Modo         | O que roda                                                                                                                                                                                                                                                         | Agentes, ordem de grandeza |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| **Completo** | 9 dimensões (ou as aplicáveis), verificação, até 3 refutações por dimensão, crítico + até 8 complementos, 6 frentes de engenharia, catálogo + Abi + Tim + persona(s) de domínio com verificação, 6 grupos de diagramas, 9 redatores, 2 editores                    | 70–90                      |
| **Padrão**   | Dimensões aplicáveis (5 a 7), 1 refutação por dimensão, até 4 complementos, 4 frentes de engenharia (`testes-catalogo`, `resultados`, `arquitetura`, `processo`), catálogo + Abi + uma persona de domínio, 4 grupos de diagramas, 6 redatores no total, 2 editores | 40–50                      |
| **Enxuto**   | Você mesmo, sem subagentes (ou poucos): dimensões em sequência, verificação feita por você ao fim de cada uma, sem GenderMag, diagramas mínimos                                                                                                                    | 0–8                        |

Workflows multiagente só com opt-in explícito do usuário (ele pede "use um workflow", ativa o modo
ultracode ou equivalente). Sem isso, use o Agent tool em ondas paralelas ou o modo enxuto, e diga o
custo aproximado antes de começar.

## Regras que valem para todo agente

Vão no `rel/contexto.md` (modelo em `metodo-lgpd.md`, seção 1), que todo prompt manda ler primeiro.
Elas protegem o titular, o usuário e a credibilidade do documento.

- **Produção é somente leitura e só agregados**, com proteção mecânica quando houver (papel e sessão
  somente leitura): catálogo, policies, configuração, contagens, datas mínima e máxima. Nenhuma
  escrita, nenhum DDL, nenhum SELECT que devolva linha com dado pessoal, e nada de subir o sistema,
  rodar testes, migrações ou scripts do repositório contra ela.
- **Antes de rodar teste, servidor ou script do repositório**, confirme o alvo do banco (host e nome,
  sem credencial) e force a instância descartável pela variável de ambiente no próprio comando.
  Configuração de projeto aponta para banco real com frequência, e fixture de teste apaga tabela. Na
  dúvida, não rode: liste e registre que não rodou.
- **Segredos nunca saem**: não imprimir nem gravar chave, token, senha, DSN. Não ler `.env*`,
  configuração local, `dist/`, `build/`, `node_modules/`, `vendor/`, `venv/`, arquivos de lock, dumps
  nem uploads. Segredo versionado: arquivo:linha e nome da variável, nunca o valor.
- **Evidência em todo fato**: `arquivo:linha` relativo ao repositório, consulta e resultado numérico,
  ou URL com data de acesso; [VERIFICADO] / [INFERIDO]; "não encontrado" diz onde procurou. Documento
  entregue pelo usuário é citado pelo nome, não pelo caminho local (que expõe o nome de usuário).
- **Estado atual, conferido no código**: documento do repositório pode estar velho.
- **Sem conclusão jurídica**: fato + dispositivo "possivelmente relacionado" + ponto para parecer.
- **Dados fictícios** em capturas e exemplos, e isso é dito no relatório.
- **Não edita o repositório** (salvo o que o usuário autorizar: um spec de captura de telas, as
  correções da F5). Não faz commit sem o usuário pedir.
- **Grava cedo** o arquivo de entrega e atualiza: interrupção por limite de gasto acontece.

## Fases

### F0 — Preparação

1. Escolha uma pasta de trabalho **permanente, fora do repositório** (os papéis de trabalho fazem
   parte da entrega e a análise pode atravessar sessões): `<trabalho>/rel/` para os papéis de trabalho,
   `<trabalho>/relatorios/` para o LaTeX, `<trabalho>/ferramentas/` para TinyTeX, Playwright etc. O
   scratchpad da sessão só serve se o usuário não quiser guardar nada.
2. Escreva `rel/contexto.md` (modelo em `metodo-lgpd.md`, seção 1) com o que o Passo 0 e uma leitura
   rápida do repositório revelaram: o sistema, titulares e papéis, pilha, modelo de autorização,
   ambientes, instância descartável, comando de banco, revisão do git (`git rev-parse --short HEAD`)
   e a data.
3. Ajuste o método ao sistema, em arquivos que os agentes leem no lugar do texto genérico:
   `rel/foco-<dimensão>.md` para as dimensões que precisarem de nomes reais ou de outro enfoque
   (obrigatório quando o titular não usa o sistema, ver `metodo-lgpd.md`, seção 4) e para dimensões
   novas; `rel/temas.json` se houver tema novo; para a UX, `rel/catalogo-instrucoes.md` (como subir a
   instância descartável e capturar), `rel/cenarios.md` e `rel/persona-<chave>-ficha.md` se já
   souber.
4. Decida os capítulos que não se aplicam (sem IA, sem lojas, sem GenderMag...) e prepare os volumes:
   `python <skill>/scripts/preparar_volumes.py <trabalho>/relatorios --sem <cap1>,<cap2>` (ver
   `redacao.md`, seções 3 e 4). Preencha a identidade no topo dos `main.tex`, instale ou localize
   `pdflatex` e PyMuPDF (`latex.md`, seção 1) e compile uma vez para provar que o ambiente funciona.

### F1 a F4 — Análise

Rodam em paralelo; a base legal deve terminar antes da consolidação.

- **F1 Base legal verificada** → `base-legal.md`. Saída `rel/base-legal.md` e `rel/legis/`.
- **F2 Trilha LGPD** → `metodo-lgpd.md`. Dimensões → verificação → refutação dos graves → crítico de
  completude → complementos → consolidação (`registro-achados-lgpd.json`, `matriz-conformidade.md`,
  `perguntas-administracao.md`, `quesitos-juridicos.md`).
- **F3 Trilha de engenharia** → `engenharia.md`. Dossiês e `rel/testes.json`.
- **F4 Trilha de UX** → `metodo-ux.md`. Catálogo de telas → cenários e método GenderMag → personas →
  verificação → consolidação. Sem interface própria, pule e retire a Parte IV do Volume II. Ao fim,
  copie as capturas para os volumes: `preparar_volumes.py <trabalho>/relatorios --telas
<trabalho>/relatorios/telas`.

**Com workflow:** leia `assets/workflows/analise.js` e passe o conteúdo como `script` na ferramenta
de workflow, com `args` (copiar o arquivo para `<repo>/.claude/workflows/` só se o usuário aceitar;
não faça commit dele). Se a execução parar no meio, retome com `resumeFromRunId`.

| Arg de `analise.js`     | Padrão          | Uso                                                                                                                               |
| ----------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `skill`, `rel`          | obrigatórios    | pasta da skill; pasta dos papéis de trabalho                                                                                      |
| `telas`                 | `<rel>/telas`   | onde gravar as capturas (sugestão: `<trabalho>/relatorios/telas`)                                                                 |
| `dimensoes`             | as 9            | lista de chaves (`"dados"`) ou objetos `{key, prefixo, titulo, web}`; chave nova = dimensão nova, com foco em `rel/foco-<key>.md` |
| `engenharia`            | as 6            | `testes-catalogo`, `resultados`, `arquitetura`, `processo`, `ia-produto`, `design`                                                |
| `ux`                    | `true`          | liga a trilha de UX (catálogo, cenários, personas)                                                                                |
| `personas`              | `["abi","tim"]` | personas GenderMag; `[]` pula o GenderMag e mantém os cenários                                                                    |
| `personasDominio`       | `["dominio"]`   | uma chave por perfil de usuário                                                                                                   |
| `minTelas`              | `5`             | abaixo disso, avaliação por leitura de código                                                                                     |
| `refutacoes`, `lacunas` | `3`, `8`        | refutadores por dimensão; complementos                                                                                            |
| `docsUx`                | `false`         | também grava as avaliações em `docs/` do repositório                                                                              |
| `modelo`, `esforco`     | `opus`, `high`  | modelo e esforço dos agentes                                                                                                      |

**Sem workflow:** dispare os agentes em ondas com o Agent tool, cada um com o prompt da referência
correspondente (todos começam por "Leia `rel/contexto.md`"). Ondas: (1) base legal, cenários e
método GenderMag, catálogo, analistas das dimensões, frentes de engenharia; (2) verificadores,
avaliadores de persona; (3) refutadores, verificadores de UX; (4) crítico; (5) complementos;
(6) consolidações.

Ao fim da análise, **mostre ao usuário** a contagem por gravidade e os dez principais achados, e
pergunte se quer corrigir algo antes de redigir (F5) ou seguir direto.

### F5 — Correções (opcional)

→ `correcoes.md`. Decisões da administração perguntadas de uma vez; ações externas pedidas como passos
concretos; correções seguindo as regras do projeto; `rel/correcoes-<data>.json`; registro gerado de
novo com selos.

### F6 — Redação

→ `redacao.md` e `latex.md`.

1. Gere o que é gerado: `gerar_registro.mjs` (capítulo 12 do Volume I) e `gerar_anexo_testes.mjs`
   (anexo do Volume II).
2. Diagramas, redatores e editores: workflow `assets/workflows/redacao.js` ou agentes em ondas
   (diagramas e redatores juntos; editores depois).

| Arg de `redacao.js`                       | Padrão       | Uso                                                               |
| ----------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `skill`, `rel`, `relatorios`, `pdflatex`  | obrigatórios | pastas e caminho do compilador                                    |
| `contexto`                                | obrigatório  | identificação do controlador, autor e destinatários, em uma frase |
| `volumes`                                 | os dois      | `"lgpd"` ou `"engenharia"` para só um                             |
| `redatoresI`, `redatoresII`               | 4 e 5 grupos | listas de capítulos por redator (só os que ficaram no `main.tex`) |
| `diagramas`                               | os 6 grupos  | grupos do quadro de `redacao.md`, seção 5                         |
| `correcoes`, `pylib`, `modelo`, `esforco` | —            | arquivo de correções; pasta do PyMuPDF; modelo e esforço          |

### F7 — Compilar, conferir, empacotar

→ `latex.md`, seções 8 e 9. Duas passadas, zero referência indefinida, overfull acima de 20 pt
tratado, conferência visual com Read de páginas variadas, depois `empacotar.py` para a pasta de
entrega (ele recusa capítulo provisório e leva só o que o `main.tex` usa). Meça o tempo de uma
passada e informe no LEIA-ME.

### F8 — Entrega

Antes de entregar, confira:

- [ ] Nenhum ID provisório (`DAD-`, `OPE-`, `-V0`) no texto; todo `\achadoref` existe no registro.
- [ ] Nenhuma frase de conclusão jurídica ("viola", "está em conformidade", "é ilegal") no Volume I.
- [ ] Todo dispositivo citado está em `rel/base-legal.md`; nenhuma "72 horas".
- [ ] Números iguais para o mesmo fato em todos os capítulos, nos indicadores e nos diagramas;
      nenhum `?` sobrando no diagrama de método.
- [ ] Se houve correções, nenhuma afirmação velha sobrou (grep pelos termos de cada achado corrigido).
- [ ] Nenhum segredo, dado pessoal real ou caminho local nos `.tex` (grep por padrões de chave, por
      e-mails, por `AppData`, `C:/Users`, `/home/`, `/Users/`).
- [ ] Capturas com legenda de dados fictícios; capa e rodapé com a identificação certa; abertura sem
      "Documento relacionado" se só um volume foi feito.
- [ ] PDFs e `.zip` na pasta de entrega; o `.zip` compila sozinho (descompacte num diretório limpo e
      rode `pdflatex` uma vez).

Na resposta ao usuário: onde estão os arquivos, número de páginas, a contagem de achados por
gravidade, o que ficou pendente de informação externa, e uma linha dizendo para quem cada volume foi
escrito. Ofereça uma mensagem curta para ele encaminhar os PDFs. Se perguntar se o sistema "está
conforme", responda com o que está resolvido e o que falta, separado entre engenharia, administração e
jurídico: a conclusão é do consultor.

## Pedidos parciais

- **Só o Volume I:** F1, F2, (F4 só o catálogo, para ilustrar), F6 só o Volume I
  (`preparar_volumes.py --so lgpd`, `volumes: "lgpd"`). Retire do capítulo de método e da abertura as
  referências ao Volume II.
- **Só o Volume II:** F3, F4, F6 só o Volume II. Sem base legal nem trilha LGPD; o capítulo 09
  (achados) traz só os de qualidade e UX; retire da abertura a referência ao Volume I.
- **Só o registro de achados, sem LaTeX:** F1 e F2, e entregue `registro-achados-lgpd.md`,
  `matriz-conformidade.md` e `quesitos-juridicos.md`.
- **Só a avaliação GenderMag ou de persona:** F4 e um documento Markdown, ou o capítulo isolado.
- **Atualizar relatório já entregue:** leia os papéis de trabalho existentes, rode só as dimensões
  afetadas pelo que mudou, regenere o registro e reedite os capítulos tocados; aumente a versão na capa.

## Adaptações

- **Titular que não usa o sistema** (clínica, escola, RH, escritório): o método vale, mas
  transparência, direitos e o ciclo de vida mudam de forma (papel, balcão, atendimento pela equipe,
  guarda obrigatória). Escreva os `foco-*.md` e siga as notas de `metodo-lgpd.md` (seção 4),
  `metodo-ux.md` (cenário 8) e `redacao.md` (seção 3).
- **Aplicação renderizada no servidor** (Flask, Django, Rails, Laravel): autorização costuma estar na
  aplicação, não no banco; a dimensão `seguranca` tem itens próprios para esse caso. Ausência de RLS
  não é achado por si.
- **Outro país ou lei (GDPR, CCPA):** troque a base legal e o critério de gravidade; mantenha o
  método. As armadilhas de citação da LGPD não se aplicam.
- **Sem app de loja ou sem web:** retire as dimensões e capítulos correspondentes; declarações
  públicas do site vão para `transparencia`.
- **Outra pilha:** as referências trazem exemplos de várias pilhas; o princípio (regra de acesso
  testada com o ator não autorizado, segredo só no servidor, consulta agregada em produção, testes só
  em instância descartável) vale para qualquer uma.
