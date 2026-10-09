# LaTeX: instalação, estilo, componentes, compilação e entrega

## Sumário

1. Instalar o compilador e o renderizador
2. Preparar as pastas
3. Personalizar a identidade visual
4. Regras de LaTeX que evitam erro de compilação
5. Componentes
6. Quadros
7. Figuras e capturas
8. Compilar, conferir e corrigir
9. Overleaf e empacotamento
10. Armadilhas já encontradas

## 1. Instalar o compilador e o renderizador

Se `pdflatex --version` funciona e os pacotes do estilo existem, use a instalação existente. Senão,
instale um TinyTeX portátil numa pasta de trabalho (sem permissão de administrador, cerca de 250 MB):

- **Windows:** baixe `https://github.com/rstudio/tinytex-releases/releases/download/daily/TinyTeX.zip`,
  descompacte; o binário fica em `TinyTeX/bin/windows/pdflatex.exe`.
- **Linux e macOS:** `curl -sL "https://yihui.org/tinytex/install-bin-unix.sh" | sh` (instala em
  `~/.TinyTeX`), ou baixe o `.tar.gz` equivalente da mesma página de releases.

O pacote `TinyTeX` (não o `TinyTeX-0`) já traz o que o estilo usa. Se a compilação acusar
`File 'xxx.sty' not found`, instale com `tlmgr install <pacote>`. Lista completa, caso precise:

```
tlmgr install newpx fontaxes mweights kastrup xstring inconsolata fontawesome5 tcolorbox tikzfill \
  pdfcol environ trimspaces pgf pgfplots standalone xurl url makecell pdflscape ragged2e babel-portuges \
  hyphen-portuguese csquotes lastpage titlesec footmisc fancyvrb microtype booktabs multirow enumitem \
  caption float bookmark hyperref geometry xcolor tools
```

Renderizador para a conferência visual: `pip install pymupdf` (ou `pip install --target <pasta>
pymupdf` e `--pylib <pasta>` no `render_paginas.py`). Alternativa: `pdftoppm` do poppler.

## 2. Preparar as pastas

```bash
python <skill>/scripts/preparar_volumes.py <relatorios>
```

Cria `<relatorios>/lgpd/` e `<relatorios>/engenharia/` (cada um com `main.tex`, `relatorio.sty`,
`capitulos/00-abertura.tex`, um capítulo provisório com o rótulo certo para cada `\input` do
`main.tex`, e `figuras/diagramas` e `figuras/telas`), `<relatorios>/diagramas/` (preâmbulo e
modelos) e `<relatorios>/estilo/` (o exemplo de componentes). Os dois volumes compilam desde o
primeiro minuto, o que deixa cada redator compilar e achar o próprio erro.

Os arquivos de modelo não são sobrescritos se já existirem; o `.sty` é sempre recopiado. O script
pode rodar de novo a qualquer momento:

- `--sem 09-inteligencia-artificial,13-ia-no-produto` retira capítulos do `main.tex` (e a `\part`
  que ficar vazia) e apaga o provisório; capítulo já escrito é mantido, com aviso.
- `--telas <pasta>` copia as capturas do catálogo para `figuras/telas/` de cada volume.
- `--so lgpd` ou `--so engenharia` prepara um volume só.

## 3. Personalizar a identidade visual

No topo de cada `main.tex`:

```latex
\newcommand{\NomeDoProduto}{App Exemplo}
\newcommand{\NomeDoAutor}{...}  \newcommand{\CargoDoAutor}{...}
\newcommand{\NomeDoDestinatario}{...}  \newcommand{\DataBase}{1 de janeiro de 2027}
\EmpresaRelatorio{Razão Social Ltda.}
\MarcaRelatorio{Marca}
\IdentificacaoRodape{CNPJ 00.000.000/0001-00 \textperiodcentered\ Cidade, UF}
```

A capa, o cabeçalho e o rodapé usam esses valores. Cores, no `relatorio.sty` (e no
`preambulo-diagrama.tex`, para os diagramas combinarem):

| Cor                    | Uso                                                 | Padrão                                                |
| ---------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `corprimaria`          | faixa da capa, títulos numerados, marcadores, links | `2C7A73`                                              |
| `corprimariaescura`    | links, caminhos de arquivo, números                 | `1F5C56`                                              |
| `cortinta`             | títulos e texto forte                               | `17252D`                                              |
| `corcinza`, `corsuave` | rótulos, rodapé, bordas                             | `5C6870`, `9AA5AC`                                    |
| `cortom`, `corpapel`   | fundos de destaque e de quesito                     | `EDF4F3`, `F7F9F9`                                    |
| `sev*`, `sit*`, `res*` | gravidade, situação e resultado                     | não mude sem motivo: o leitor aprende o código de cor |

Para trocar a cor da marca, mude `corprimaria` e `corprimariaescura` nos dois arquivos e confira o
contraste (texto branco sobre a faixa da capa).

## 4. Regras de LaTeX que evitam erro de compilação

Valem para todo redator. Copie esta seção no prompt quando houver dúvida.

- Só os pacotes já carregados pelo `relatorio.sty`. Não acrescente `\usepackage` nem `\newcommand` nos
  capítulos.
- Escape sempre: `\%`, `\&`, `\#`, `\_`, `\$` (`R\$~10.200,00`), `\{`, `\}`. Til e circunflexo
  soltos: `\textasciitilde`, `\textasciicircum`. Barra invertida: `\textbackslash`.
- Identificadores de código, nomes de coluna, função, rota e qualquer coisa com `_`: `\cod{...}`
  (aceita `_ / . : - ( )` sem escape). Caminho com linha: `\arq{src/lib/x.ts:9}`. **Não** use `\cod`
  nem `\arq` em `\chapter`, `\section`, `\caption` nem nos títulos de `achado`, `ficha` e `quesito`:
  ali escreva o nome por extenso, com `\_` se precisar. Dentro de `\cod`/`\arq` não podem aparecer
  `%`, `#` nem `\`.
- Acentos e `º ª § – — “ ” … ·` direto (UTF-8). Sem emoji. Setas e comparações: `$\rightarrow$`,
  `$\geq$`, `$\leq$`, `$\times$`, `$\approx$` (o estilo também aceita `→ ≥ ≤ ≈ ≠ ✓` digitados).
- Aspas: `\enquote{texto}`. Citação literal de lei entre `\enquote{...}`.
- Espaço inquebrável: `art.~18`, `Quadro~3`, `400~usuários`.
- Números: milhar com ponto, decimal com vírgula (`319.344`, `0,5~s`, `98,5\%`).
- Parágrafo é linha em branco. Sem `\\` para espaçar, sem `\vspace` manual, sem `\newpage` (salvo
  antes de quadro grande).
- Nota de rodapé para a transcrição de dispositivo legal e para a fonte de um número:
  `\footnote{\lgpd{art.~18, VI}: \enquote{...}.}`.
- Referência cruzada: `\label{cap:seguranca}` / `\ref{cap:seguranca}`; achados por
  `\achadoref{LGPD-07}` e `\ref{achado:LGPD-07}`.

## 5. Componentes

`assets/latex/exemplo-componentes.tex` mostra todos em uso; compile-o para ver.

| Uso                                    | Código                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ficha de achado (quebra entre páginas) | `\begin{achado}{LGPD-07}{Título sem código}{alta} \campo{Fato apurado} ... \campo{Evidência} ... \end{achado}`; gravidades `critica`, `alta`, `media`, `baixa`, `informativa` |
| Rótulo de campo                        | `\campo{Fato apurado}` seguido de parágrafo normal                                                                                                                            |
| Selo de gravidade                      | `\gravidade{media}`                                                                                                                                                           |
| Situação (ícone / com texto)           | `\situacao{atende}` / `\situacaotexto{parcial}`; valores `atende`, `parcial`, `naoatende`, `externo`, `na`                                                                    |
| Selo livre                             | `\selo{sitatende}{Corrigido}` (cor, texto)                                                                                                                                    |
| Ficha de teste                         | `\begin{ficha}{S1}{Título}{passou} ... \end{ficha}`; resultados `passou`, `falhou`, `parcial`, `bloqueado`, `naoexecutado`; selo solto `\resultado{passou}`                   |
| Quesito (numera sozinho)               | `\begin{quesito}{Título} \campo{Fato que motiva a pergunta} ... \campo{Pergunta} ... \end{quesito}`                                                                           |
| Ponto para parecer jurídico            | `\begin{pontoparecer} ... \end{pontoparecer}`                                                                                                                                 |
| Nota / Atenção                         | `\begin{nota}[Título opcional] ... \end{nota}`, `\begin{atencao} ... \end{atencao}`                                                                                           |
| Conformidade demonstrada               | `\begin{conforme} ... \end{conforme}`                                                                                                                                         |
| Informação da administração            | `\begin{pendente} ... \end{pendente}`                                                                                                                                         |
| Lição / Como aplicar                   | `\begin{licao} ... \end{licao}`, `\begin{pratica} ... \end{pratica}`                                                                                                          |
| Destaque neutro (síntese de capítulo)  | `\begin{destaquebox} ... \end{destaquebox}`                                                                                                                                   |
| Indicadores (3 ou 4 lado a lado)       | `\begin{minipage}{0.235\textwidth}\indicador{48/50}{sondas barradas}\end{minipage}\hfill ...`                                                                                 |
| Número, ênfase, termo                  | `\numero{242 ms}`, `\destaque{texto}`, `\termo{row-level security}`                                                                                                           |
| Código ou SQL                          | `\begin{codigo} ... \end{codigo}` (verbatim; linhas até 95 caracteres)                                                                                                        |
| Assinatura                             | `\assinatura{Nome}{Cargo}`                                                                                                                                                    |

## 6. Quadros

`booktabs` (`\toprule`, `\midrule`, `\bottomrule`), nunca linha vertical. Colunas: `L{3cm}` (largura
fixa, à esquerda), `C{2cm}`, `R{2cm}`, `Y` (largura automática em `tabularx`). Cabeçalho:
`\linhacab \cab{Coluna}`. Antes do quadro: `\tabelapequena` (ou `\tabelaminima` para os densos).

```latex
\begin{table}[H]
\tabelapequena
\caption{Título do quadro}\label{qd:exemplo}
\begin{tabularx}{\textwidth}{L{3cm}YC{2cm}}
\toprule
\linhacab \cab{Item} & \cab{Descrição} & \cab{Situação}\\
\midrule
Linha & Texto & \situacao{atende}\\
\bottomrule
\end{tabularx}
\end{table}
```

Quadro de mais de uma página: `longtable` com colunas `L{}` somando cerca de 15,2 cm em retrato
(23,5 cm em paisagem, dentro de `\begin{landscape}`), `\caption` na primeira linha, `\endfirsthead` e
`\endhead` repetindo o cabeçalho. Dentro de célula, nunca `itemize`: separe com ponto e vírgula ou
`\newline`.

## 7. Figuras e capturas

```latex
\begin{figure}[H]\centering
\includegraphics[width=\textwidth]{figuras/diagramas/fluxo-dados.pdf}
\caption{Fluxo de dados pessoais}\label{fig:fluxo}
\end{figure}

\begin{figure}[H]\centering
\tela[0.30\textwidth]{figuras/telas/11-termo-topo.png}{Topo do termo}\hfill
\tela[0.30\textwidth]{figuras/telas/12-termo-fim.png}{Fim, com o botão}\hfill
\tela[0.30\textwidth]{figuras/telas/13-perfil.png}{Perfil}
\caption{Aceite do termo (dados fictícios)}\label{fig:termo}
\end{figure}
```

O `\tela[0.30\textwidth]` serve para captura vertical de celular. Captura de desktop: uma por figura
com `\tela[\textwidth]`, ou duas lado a lado com `\tela[0.48\textwidth]`.

Diagramas são pré-renderizados em PDF (ver `redacao.md`, seção 5): o capítulo só inclui o PDF. Isso
mantém a compilação do volume rápida e isola erro de TikZ na figura.

## 8. Compilar, conferir e corrigir

```bash
cd <relatorios>/lgpd
pdflatex -interaction=nonstopmode -halt-on-error main.tex   # duas vezes: sumário e referências
pdflatex -interaction=nonstopmode -halt-on-error main.tex
grep -c "undefined" main.log                                  # referências indefinidas: tem de dar 0
python <skill>/scripts/overfull.py main.log --minimo 20        # caixas estourando a margem
python <skill>/scripts/render_paginas.py main.pdf png --dpi 60
```

O render gera todas as páginas (`p001.png`, `p002.png`...); use `--paginas 40-45` para refazer só um
trecho. Abra com Read umas 12 páginas variadas: capa, sumário, início de capítulo, uma ficha, um quadro
paisagem, uma figura, uma página de capturas, a última página. Procure texto cortado, caixa
estourando, figura ilegível, página quase vazia antes de quadro, sumário com título longo quebrando
mal.

## 9. Overleaf e empacotamento

```bash
python <skill>/scripts/empacotar.py \
  --volume <relatorios>/lgpd Volume-I-Protecao-de-Dados <segundos> \
  --volume <relatorios>/engenharia Volume-II-Engenharia-e-Qualidade <segundos> \
  --destino <pasta de entrega>
```

Gera, por volume, o PDF final e um `.zip` para Overleaf (New Project > Upload Project) com
`main.tex`, o `.sty`, os capítulos, **só as figuras usadas** e um `LEIA-ME.txt`. O script falha se um
capítulo referencia figura que não existe.

O plano gratuito do Overleaf limita a compilação a cerca de 10 s; um volume de 150 a 250 páginas leva
de 10 a 25 s numa máquina comum. Meça o tempo de uma passada local e passe no `<segundos>`: o
LEIA-ME explica as saídas (PDF pronto para imprimir; `\include` + `\includeonly` para editar um
capítulo por vez; plano pago; compilar localmente).

## 10. Armadilhas já encontradas

- **`\nolinkurl` comia espaços** dentro de `\cod{}`/`\arq{}`. Resolvido no estilo com
  `\PassOptionsToPackage{obeyspaces,spaces}{url}` antes do `xurl`. Não remova.
- **Caminhos e tokens longos estouram a margem** em células estreitas: `\arq` quebra em `/`, mas um
  identificador longo sem barra não. O gerador do registro insere `\allowbreak{}` depois de `. | =`
  em tokens com mais de 22 caracteres; nos capítulos escritos à mão, faça o mesmo ou reescreva.
- **Datas parecem caminhos** (`05/10/2026`) para heurísticas de detecção de caminho; o gerador as
  exclui. Se escrever detecção própria, exclua datas e frações.
- **Escapes em heredoc de shell:** `\r`, `\t`, `\u` dentro de strings Python ou JS geradas por
  heredoc viram caracteres de controle e quebram `\ref`, `\textbf`, `\usepackage`. Grave arquivos
  `.tex` e scripts com a ferramenta de escrita de arquivo, não com `cat <<EOF` nem `python -c`.
- **Capítulo provisório sem rótulo** quebra `\ref` da abertura: o `preparar_volumes.py` cria os
  provisórios já com o rótulo certo; ao substituir, mantenha o mesmo `\label`.
- **Figura inexistente** derruba a compilação com `-halt-on-error`: o redator referencia, o editor
  confere se existe e remove a referência se não existir.
- **Overfull em índice de achados:** colunas estreitas com títulos longos; o gerador já usa larguras
  testadas e rótulos curtos de situação (`Corrigido`, `Em parte`, `Externo`).
