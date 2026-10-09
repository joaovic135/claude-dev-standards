# Redação dos dois volumes

Depois da análise, a redação. Ela tem quatro tipos de trabalho, que podem rodar em paralelo até a
edição:

1. **Gerados por script** (não escritos à mão): o registro de achados (Volume I, capítulo 12) e o
   catálogo de testes (Volume II, anexo). Rode antes dos redatores, para que eles possam citar.
2. **Diagramas** pré-renderizados em PDF vetorial.
3. **Redatores**, cada um com capítulos disjuntos.
4. **Editores**, um por volume: coerência, sumário executivo, guia prático, glossário, compilação e
   conferência visual.

Leia também `latex.md` (componentes, regras de LaTeX e armadilhas). Os redatores devem ler
`<relatorios>/estilo/exemplo-componentes.tex` e a seção "Regras de LaTeX" de `latex.md` antes de
escrever.

## Sumário

1. Gerar o que é gerado
2. Prompt base dos redatores
3. Volume I — roteiro por capítulo
4. Volume II — roteiro por capítulo
5. Diagramas
6. Editores
7. Regras de redação

## 1. Gerar o que é gerado

```bash
node <skill>/scripts/gerar_registro.mjs --registro rel/registro-achados-lgpd.json \
  --saida relatorios/lgpd/capitulos/12-registro-de-achados.tex \
  --revisao "<hash>, de <dd/mm/aaaa>" [--correcoes rel/correcoes-<data>.json \
  --data-correcoes "<d de mês de aaaa>" --data-correcoes-curta "<dd/mm>"]
node <skill>/scripts/gerar_anexo_testes.mjs --testes rel/testes.json \
  --saida relatorios/engenharia/capitulos/anexo-testes.tex
```

O registro gerado não se edita à mão: se um achado está errado, corrija o JSON e gere de novo. Os
redatores citam as fichas por `\achadoref{LGPD-07}` e `\ref{achado:LGPD-07}`.

## 2. Prompt base dos redatores

```
Você está redigindo parte de um relatório formal em LaTeX, em português do Brasil, para <empresa>
sobre <sistema>. Hoje é <data>. O repositório fica em <caminho>; consulte-o só para confirmar um fato
quando os dossiês divergirem. Não edite o repositório.
Leia primeiro, inteiros: <skill>/references/latex.md (seções de regras e componentes) e
<relatorios>/estilo/exemplo-componentes.tex. Siga-os à risca: só os componentes do estilo;
identificadores e caminhos sempre em \cod{} ou \arq{}; nenhum pacote novo; nenhum comando novo
definido por você; nada de \cod nem \arq em títulos de capítulo, seção, legenda ou nos argumentos de
achado, ficha e quesito.
Fontes de fato (não invente nada que não esteja nelas; quando faltar, use uma caixa pendente ou omita):
- Trilha LGPD, já verificada: <rel>/registro-achados-lgpd.md e .json (só estes IDs LGPD-nn valem;
  nunca cite IDs provisórios como DAD-03 ou OPE-V02), matriz-conformidade.md,
  perguntas-administracao.md, quesitos-juridicos.md, os dossiês dossie-*.md (a seção "Verificação
  independente" prevalece sobre o corpo), refutacoes/ e complementos/.
- Correções feitas depois da análise, se houver: <rel>/correcoes-<data>.json. O fato apurado continua
  relatado como fato da data da análise, seguido da correção.
- Identificação do controlador: <razão social, CNPJ, endereço, marca, encarregado e contato>. Use
  sempre essa; divergências antigas são fato histórico (cite o achado).
- O capítulo de registro de achados já foi gerado por script: não o edite.
- Base jurídica: <rel>/base-legal.md. Cite dispositivos só com a redação e os números de lá; a
  transcrição literal vai em nota de rodapé entre \enquote{}.
- Trilha de engenharia: <rel>/dossie-arquitetura.md, dossie-processo.md, dossie-testes-catalogo.md,
  dossie-resultados.md, dossie-ia-produto.md, dossie-design.md, testes.json.
- Avaliações de uso: <rel>/gendermag-metodo.md, cenarios.md, gendermag-*.md, persona-*.md,
  ux-consolidado.md.
- Catálogo de telas: <rel>/catalogo/telas.json; as imagens já foram copiadas para figuras/telas/ de
  cada volume. Referencie como figuras/telas/<arquivo>.png (o empacotamento leva só as usadas). Abra a
  imagem com Read antes de citá-la, para a legenda descrever o que se vê. Diga uma vez que os dados das
  capturas são fictícios. Captura de celular: \tela[0.30\textwidth]; de desktop: \tela[\textwidth]
  ou duas lado a lado com \tela[0.48\textwidth].
- Diagramas: figuras/diagramas/<nome>.pdf (lista na seção 5 de redacao.md).
Regras: uma \begin{destaquebox} de 3 a 5 linhas no início de cada capítulo com a síntese; distinguir
verificado, inferido e dependente da administração; nenhum dado pessoal real, nenhum segredo;
números exatamente como nas fontes; cada capítulo do Volume I termina com a lista dos achados que lhe
dizem respeito (\achadoref + uma linha), sem repetir a ficha. Escreva cada arquivo com Write; o
arquivo começa direto em \chapter{...}\label{...} (use o rótulo da seção 3 ou 4 de redacao.md).
Antes de terminar, compile o volume (<pdflatex> -interaction=nonstopmode -halt-on-error main.tex na
pasta do volume) e corrija todo erro do seu capítulo. Não apague arquivos de outros. Devolva:
arquivos escritos, contagem aproximada de palavras, figuras referenciadas, pendências de fato.
```

Acrescente ao final do prompt: o volume e o leitor (abaixo), a lista de arquivos do redator e o roteiro
de cada capítulo.

Leitores:

- **Volume I:** advogado sênior, não engenheiro. Registro técnico-formal, sem parecer jurídico.
- **Volume II:** engenheiro de software; será folheado por um advogado. Funciona como guia: cada
  capítulo explica o quê, o porquê, como foi aplicado neste projeto, a evidência e a lição.

Distribua os capítulos em 4 redatores no Volume I e 5 no Volume II (agrupe capítulos que compartilham
fontes). **Capítulos não aplicáveis** são decididos e retirados pelo orquestrador **antes** da
redação, com `python <skill>/scripts/preparar_volumes.py <relatorios> --sem <cap1>,<cap2>` (tira a
linha do `main.tex`, a `\part` que ficar vazia e o provisório). Redator não apaga arquivo nem mexe no
`main.tex`; se achar que um capítulo seu não tem fato que o sustente, escreve a versão curta e avisa.

## 3. Volume I — roteiro por capítulo

Tamanhos são alvo, não teto; um capítulo com pouco fato fica curto.

| Arquivo                        | Rótulo               | Palavras    | Conteúdo                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 00-abertura                    | —                    | —           | Já vem do modelo; o editor ajusta datas, revisão, ambientes e o que não foi examinado.                                                                                                                                                                                                                                                                                                                             |
| 01-sumario-executivo           | cap:sumario          | 1.100–1.500 | **Escrito pelo editor**, por último.                                                                                                                                                                                                                                                                                                                                                                               |
| 02-objeto-e-metodo             | cap:metodo           | 900–1.300   | Perguntas que o relatório responde; quadro de fontes examinadas (fonte, o que foi visto, limite); o método em etapas com a figura `metodo.pdf`; quadro com o critério de gravidade; convenção verificado/inferido/externo; limites e data-base; nota sobre dados sintéticos e consultas agregadas.                                                                                                                 |
| 03-o-sistema                   | cap:sistema          | 1.400–2.000 | O produto em linguagem acessível (quem usa, para quê, plataformas, números de produção); a relação contratual (o termo, o que diz e não diz sobre dados); a arquitetura para jurista com `arquitetura.pdf` e `fluxo-dados.pdf`; papéis prováveis de cada ator como hipóteses com pontos para parecer; identificação do controlador e divergências; duas capturas.                                                  |
| 04-inventario-de-dados         | cap:inventario       | 1.800–2.600 | Categorias de titulares; o quadro-mestre em página paisagem (longtable em landscape): dado, titular, origem, finalidade aparente, onde fica, quem acessa, retenção observada, compartilhado com; documentos exigidos e volume; dados sensíveis em visão geral; aparelho e navegador; volumes.                                                                                                                      |
| 05-transparencia-e-bases       | cap:transparencia    | 1.800–2.600 | O que o titular é informado e quando; o termo: apresentação (capturas), registro do aceite, o que promete registrar × o que registra (quadro), versionamento; permissões, analytics e mensagens; encarregado e canal; quadro operação por operação com a base que aparenta buscar (hipótese) e os pontos para parecer.                                                                                             |
| 06-compartilhamento            | cap:compartilhamento | 1.600–2.300 | Matriz de operadores com `fluxo-dados.pdf`; o que vai para cada um e por que importa; logout e exclusão; divergências entre código e produção.                                                                                                                                                                                                                                                                     |
| 07-direitos-e-ciclo-de-vida    | cap:direitos         | 1.800–2.500 | Matriz do art. 18 inciso a inciso; encerramento de conta com `ciclo-conta.pdf` e capturas; o que é apagado e o que permanece; retenção observada e ausência de política; registros de acesso; o que sobra no aparelho.                                                                                                                                                                                             |
| 08-dados-sensiveis-e-terceiros | cap:terceiros        | 1.400–2.000 | Onde aparecem dados de terceiros e sensíveis; tipo de informação dimensionado sem expor conteúdo; a cadeia por onde passa e quem lê; capturas com dados fictícios; sigilos setoriais como pontos para parecer. Remova se não houver.                                                                                                                                                                               |
| 09-inteligencia-artificial     | cap:ia               | 1.200–1.700 | Cada uso de IA (o que vai, a quem, retenção segundo o fornecedor, o que o usuário sabe, limites); inventário de decisões automatizadas e quais poderiam atrair o art. 20 (hipótese). Remova se não houver IA nem decisão automatizada relevante.                                                                                                                                                                   |
| 10-seguranca                   | cap:seguranca        | 2.000–2.800 | Autenticação, autorização (resultados da matriz com ator não autorizado), segredos, transporte, aparelho, webhooks e funções, monitoramento, cadeia de suprimentos, backup, disponibilidade (números de carga em uma frase cada), incidentes (ausência de plano e o prazo da Res. 15/2024 como fato), acesso administrativo.                                                                                       |
| 11-canais-publicos             | cap:canais           | 1.100–1.600 | O que as lojas e o site declaram × o que o sistema faz; política vinculada; exclusão pelas lojas; permissões; versão web (armazenamento, tokens em URL, cabeçalhos, indexação).                                                                                                                                                                                                                                    |
| 12-registro-de-achados         | cap:achados          | —           | **Gerado por script.**                                                                                                                                                                                                                                                                                                                                                                                             |
| 13-quesitos                    | cap:quesitos         | 1.200–1.800 | Um parágrafo de introdução; um `quesito` por pergunta de `quesitos-juridicos.md`, agrupados por tema, cada um com o fato (com `\achadoref`) e a pergunta; termina com as decisões que ficam com a administração depois do parecer.                                                                                                                                                                                 |
| 14-plano-de-adequacao          | cap:plano            | 1.800–2.600 | Se houve correções: quadro (achado, o que foi feito, como foi verificado, o que falta, de quem depende) e um parágrafo por grupo. Depois o plano: princípios (corrigir primeiro o que expõe dado hoje; não criar documento que o sistema não cumpra); ondas de 15, 30, 60 e 90 dias em quadro (medida, achados, responsável, dependências, esforço); o que pode ser feito sem o parecer; indicadores de conclusão. |
| anexo-matriz                   | anexo:matriz         | —           | De `matriz-conformidade.md`: longtable tema a tema com `\situacao`, evidência curta e achados.                                                                                                                                                                                                                                                                                                                     |
| anexo-administracao            | anexo:administracao  | —           | De `perguntas-administracao.md`: agrupadas, numeradas, cada uma dizendo por que importa.                                                                                                                                                                                                                                                                                                                           |
| anexo-evidencias               | anexo:evidencias     | —           | Quadro dos testes citados (ID, o que prova, onde está registrado) e dos arquivos mais citados, para conferência por terceiro.                                                                                                                                                                                                                                                                                      |
| anexo-glossario                | anexo:glossario      | —           | 30 a 45 termos técnicos explicados para jurista em uma ou duas frases, ordem alfabética.                                                                                                                                                                                                                                                                                                                           |
| anexo-normas                   | anexo:normas         | —           | De `base-legal.md`: dispositivos citados no volume com a transcrição curta e a fonte oficial com data de acesso; regulamentos da ANPD e normas setoriais; o que não foi verificado.                                                                                                                                                                                                                                |

Opcional: `anexo-termo` com a íntegra do termo de uso vigente, gerada do arquivo de texto do repositório.

Quando o titular **não** usa o sistema (operado por equipe):

- 05 descreve o que o titular recebe fora do sistema (papel, balcão, site, mensagem automática) e o
  que o sistema registra disso; capturas, só das telas em que a equipe registra ou consulta isso.
- 07 troca "encerramento de conta" pelo atendimento do pedido do titular pela equipe e pela guarda
  obrigatória; `ciclo-conta.pdf` vira o ciclo de vida do registro do titular (criação, uso, guarda,
  eliminação ou anonimização).
- 11 cobre só o site e as páginas públicas, com o título ajustado; sai se não houver exposição
  pública.

## 4. Volume II — roteiro por capítulo

| Arquivo                      | Rótulo               | Palavras    | Conteúdo                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00-abertura                  | —                    | —           | Do modelo; o editor ajusta.                                                                                                                                                                                                                                                                                                                                               |
| 01-visao-geral               | cap:visao            | 900–1.300   | O que o produto faz e para quem; números do projeto em `\indicador` (linhas de código por área, telas, migrações, regras de acesso, funções, testes, commits, período); plataformas e ambientes; como ler.                                                                                                                                                                |
| 02-arquitetura               | cap:arquitetura      | 2.000–2.800 | Camadas e fronteiras com `camadas.pdf`; componentes e integrações com `arquitetura.pdf`; modelo de dados e segurança no banco; máquina de estados central com `ciclo-<entidade>.pdf`; integrações; notificações; monitoramento; cada seção com a lição.                                                                                                                   |
| 03-regras-de-codificacao     | cap:regras           | 1.600–2.200 | Invariantes (o que diz, problema que evita, onde é imposta, exemplo); convenções; registro de padrões; portão único; armadilhas registradas e o que ensinaram.                                                                                                                                                                                                            |
| 04-processo                  | cap:processo         | 1.800–2.500 | Fluxo real; commits convencionais e versionamento com números do git e `linha-do-tempo.pdf`; pipeline com `pipeline-ci.pdf`; auditoria de dependências; o que deu certo e o que falhou, com a lição.                                                                                                                                                                      |
| 05-ia-no-desenvolvimento     | cap:iadev            | 1.800–2.400 | O arquivo de instruções como contrato; agentes especializados; hooks e permissões; planos escritos para execução por agente; verificação adversarial e refutação (exemplos concretos em que a refutação mudou a conclusão) com `metodo-agentes.pdf`; memória entre sessões; limites e falhas; como reproduzir em outro projeto. Sem uso de IA no desenvolvimento: remova. |
| 06-estrategia-de-testes      | cap:estrategia       | 1.200–1.700 | Teste onde errar é caro; níveis e ferramentas com `niveis-de-teste.pdf`; recorte de cobertura e por que porcentagem não é meta; o teste do ator não autorizado; dados de teste e limpeza; ambientes.                                                                                                                                                                      |
| 07-catalogo-de-testes        | cap:catalogo         | 1.400–2.000 | Visão por área das suítes e casos, com contagens em quadro-resumo; o que cada área protege; remete ao `anexo:testes`.                                                                                                                                                                                                                                                     |
| 08-plano-e-resultados        | cap:resultados       | 2.800–3.800 | Uma `ficha` por suíte executada (objetivo, método, resultado, números); gráficos de carga e desempenho; refutações que mudaram conclusões; o que não foi executado e por quê; linha do tempo.                                                                                                                                                                             |
| 09-achados                   | cap:achadosqualidade | 1.000–1.500 | Achados técnicos e de UX por gravidade com critério de pronto; corrigidos; pendentes de decisão.                                                                                                                                                                                                                                                                          |
| 10-ux-e-design               | cap:ux               | 1.200–1.700 | Princípios e como são impostos (tokens, lint, componentes, modo escuro, acessibilidade); auditorias anteriores; lacunas honestas.                                                                                                                                                                                                                                         |
| 11-gendermag                 | cap:gendermag        | 2.200–3.000 | Ver `metodo-ux.md`, seção 8; figuras `gendermag-facetas.pdf` e `gendermag-cenarios.pdf`.                                                                                                                                                                                                                                                                                  |
| 12-persona-de-dominio        | cap:persona          | 1.600–2.200 | Ver `metodo-ux.md`, seção 8.                                                                                                                                                                                                                                                                                                                                              |
| 13-ia-no-produto             | cap:iaapp            | 1.800–2.400 | Arquitetura de cada uso de IA, salvaguardas, avaliação, decisões e lições. Remova se não houver.                                                                                                                                                                                                                                                                          |
| 14-como-fazer-um-bom-produto | cap:guia             | 2.200–3.000 | **Escrito pelo editor.**                                                                                                                                                                                                                                                                                                                                                  |
| anexo-testes                 | anexo:testes         | —           | **Gerado por script.**                                                                                                                                                                                                                                                                                                                                                    |
| anexo-regras                 | anexo:regras         | —           | Quadro com cada regra própria de lint e cada verificação do portão: o que barra, onde está configurada.                                                                                                                                                                                                                                                                   |
| anexo-scripts                | anexo:scripts        | —           | Remete ao `anexo:testes` e descreve, em um parágrafo por família de script, como rodar e o que precisa no ambiente.                                                                                                                                                                                                                                                       |
| anexo-glossario              | anexo:glossario      | —           | **Escrito pelo editor**: 35 a 50 termos.                                                                                                                                                                                                                                                                                                                                  |

Ajustes comuns do Volume II:

- 03 sem regras escritas no projeto: descreve as convenções que o código segue, com exemplos, e a
  ausência de regra escrita e de imposição como achado (vai também para o 09). Não invente invariantes.
- 05 sai sem uso de IA no desenvolvimento; 13 sai sem IA no produto; 10 sai sem a frente `design`;
  11 sai sem GenderMag; 12 fica com uma seção por persona de domínio quando há mais de uma.
- 08 sem plano de testes formal: descreve o que existe (CI, suítes) e diz que não há plano.

## 5. Diagramas

Figuras standalone em `<relatorios>/diagramas/`, cada uma `\documentclass[border=6pt]{standalone}` +
`\input{preambulo-diagrama}` (cores e estilos prontos; não defina cores novas). Modelos:
`camadas.tex` (camadas), `metodo.tex` (etapas com números em macros no topo), `grafico-l1.tex`
(barras com limite de aceitação).

Conjunto usual, agrupado por afinidade (um agente por grupo):

| Grupo   | Figuras                                                                                                                                                                                                                                                                | Fonte de fato                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| fluxo   | `fluxo-dados` (titular → app → banco com região → terceiros, setas rotuladas com as categorias de dados, caixas com país), `arquitetura` (mesma topologia como componentes, sem países) e `camadas` (camadas do código e direção de dependência; modelo `camadas.tex`) | dossiê de operadores (verificação), registro, dossiê de arquitetura |
| ciclos  | `ciclo-conta` (linha do tempo da exclusão: pedido, janela, eliminação, o que permanece) e `ciclo-<entidade>` (máquina de estados central, com quem dispara cada transição)                                                                                             | dossiê de direitos; documentos de integração; dossiê de arquitetura |
| métodos | `metodo` (as cinco etapas com os números reais) e `metodo-agentes` (processo de desenvolvimento assistido)                                                                                                                                                             | contagens dos papéis de trabalho; dossiê de processo                |
| achados | `achados-gravidade` (barras por gravidade, cores `sev*`) e `achados-tema` (barras empilhadas por tema)                                                                                                                                                                 | **conte no JSON do registro**; não estime                           |
| entrega | `pipeline-ci`, `niveis-de-teste`, `linha-do-tempo` (commits por mês com marcos)                                                                                                                                                                                        | CI, `testes.json`, dossiê de resultados e de processo               |
| ux      | `gendermag-facetas`, `gendermag-cenarios` e os gráficos de carga                                                                                                                                                                                                       | relatórios verificados, `ux-consolidado.md`, dossiê de resultados   |

Prompt de diagrama:

```
Você produz figuras vetoriais para dois relatórios formais em LaTeX. Pasta: <relatorios>/diagramas.
Lá estão preambulo-diagrama.tex (fontes, cores e estilos: use-os, não defina cores novas) e os
exemplos camadas.tex, metodo.tex e grafico-l1.tex. Cada figura é standalone e compila com
"<pdflatex>" -interaction=nonstopmode -halt-on-error <nome>.tex nessa pasta. Para conferir, rode
python <skill>/scripts/render_paginas.py <nome>.pdf png-<nome> --dpi 110 e abra o PNG com Read.
Itere até ficar correta e legível: texto em sans, sem sobreposição, sem texto cortado, largura final
entre 13 e 16 cm, caixas alinhadas, setas limpas.
Português do Brasil. Sem segredos nem dados pessoais. Fatos só das fontes indicadas; número que a
fonte não traz não entra: reduza a figura ao que está provado.
Figuras: <nomes>. <descrição e fontes>.
Ao terminar, copie os PDFs para <relatorios>/lgpd/figuras/diagramas e
<relatorios>/engenharia/figuras/diagramas e devolva nomes, o que cada uma mostra, fontes e limitações.
```

## 6. Editores

Um por volume, depois de todos os redatores e diagramas.

**Editor do Volume I:**

1. Confira a estrutura: nenhum capítulo incluído no `main.tex` termina em "Em elaboração."; nenhuma
   `\part` sem capítulo; a abertura cita só as partes e o volume relacionado que existem.
2. Leia todos os capítulos. Coerência: mesmo termo para a mesma coisa; mesmos números para o mesmo
   fato (divergência: confira no registro ou no dossiê e corrija); `\achadoref` existentes no
   registro; `\ref` para rótulos existentes; nenhum ID provisório no texto; nenhuma afirmação jurídica
   conclusiva (reescreva como fato + ponto para parecer); nenhuma figura inexistente; repetições
   cortadas.
3. Escreva `01-sumario-executivo.tex` (1.100 a 1.500 palavras): propósito em um parágrafo; correções
   já feitas, se houver (quantos corrigidos, em parte, dependentes de ação externa); três ou quatro
   `\indicador` com os números mais eloquentes; as conclusões principais em 8 a 12 itens numerados,
   cada um com `\achadoref`; quadro-síntese de situação por tema com `\situacao`; as cinco prioridades;
   o que se pede ao consultor; limites em três linhas.
4. Ajuste `00-abertura.tex` (datas, revisão, ambientes, o que não foi examinado).
5. Compile duas vezes, corrija erros e referências indefinidas, rode `scripts/overfull.py main.log
--minimo 20` e trate o que aparecer, renderize umas 12 páginas variadas (capa, sumário, uma ficha,
   um quadro paisagem, uma figura) e confira com Read.
6. Devolva alterações por capítulo, número de páginas e pendências.

**Editor do Volume II:** os mesmos passos de coerência e compilação, mais:

- `14-como-fazer-um-bom-produto.tex` (2.200 a 3.000 palavras): de 12 a 18 práticas destiladas de tudo
  o que foi lido, cada uma em seção curta com `\begin{pratica}` (o que fazer e como), a evidência neste
  projeto (o que aconteceu quando foi aplicada ou quando faltou, com referência ao capítulo) e
  `\begin{licao}`; termina com uma lista de verificação de uma página para começar um projeto novo.
- `anexo-glossario.tex`: 35 a 50 termos, ordem alfabética.

## 7. Regras de redação

- Português do Brasil, registro técnico-formal. Uma ideia por frase. Voz ativa.
- Sem adjetivo de autoelogio (robusto, moderno, completo, rigoroso), sem advérbio de ênfase, sem
  metáfora. O documento impressiona pela **precisão**, não pelo tom.
- Todo fato tem fonte: arquivo e linha, consulta e número, identificador do teste, ou URL com data.
  No Volume I, sempre três planos: verificado; inferência; dependente de informação externa ao código.
- O Volume I não dá parecer. Descreve fatos e indica dispositivos "possivelmente relacionados". A
  qualificação jurídica vira `pontoparecer` ou `quesito`.
- Termo técnico explicado na primeira ocorrência, em uma oração (por exemplo: "política de segurança
  em nível de linha, a regra do próprio banco de dados que decide quais linhas cada usuário
  enxerga"). Depois, sempre o mesmo termo. Siglas por extenso na primeira vez.
- Nenhum segredo, chave, token ou dado pessoal real. Capturas e exemplos são fictícios, dito uma vez.
- Dispositivos legais: só os de `base-legal.md`, com a redação de lá.
- Datas por extenso no texto corrido (2 de outubro de 2026); em quadros, `02/10/2026`.
- Números em português: milhar com ponto, decimal com vírgula.
