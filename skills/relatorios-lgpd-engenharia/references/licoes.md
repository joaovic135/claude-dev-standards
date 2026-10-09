# Lições da execução que originou esta skill

O que deu errado ou quase deu, e o que fazer para não repetir.

## Custo e interrupção

- **A análise completa é cara.** Na execução de referência: cerca de 60 agentes de análise
  (9 analistas, 9 verificadores, 15 refutadores, 1 crítico, 8 complementos, 1 consolidação,
  6 de engenharia, 3 de UX e 3 verificadores de UX, base legal, método, catálogo) e mais 17 de
  redação (6 de diagramas, 9 redatores, 2 editores). Avise o usuário do porte antes e ofereça os
  modos reduzidos (ver SKILL.md).
- **Limite de gasto e interrupções acontecem no meio.** Por isso: (1) todo agente grava o arquivo de
  entrega cedo e atualiza; (2) o `contexto.md` diz que pode haver arquivos parciais de execução
  anterior, a reaproveitar depois de conferir; (3) com workflows, retome com `resumeFromRunId` (o que
  terminou volta do cache); (4) mantenha análise e redação em workflows separados (os dois modelos da
  skill) e, se a análise cair depois das dimensões, rode o crítico, os complementos e a consolidação
  em uma execução menor, que lê os dossiês já gravados.
- **Agentes concorrentes na mesma CLI de banco** geram erros transitórios de conexão. Diga no contexto
  que são esperados e quantas vezes repetir; agrupe consultas numa chamada.

## Verdade

- **Documentos mentem por idade.** Auditorias e backlogs do repositório descrevem o estado de quando
  foram escritos. Itens "abertos" já estavam corrigidos e vice-versa. Regra: confirme no código.
- **A refutação muda conclusões.** Achados graves foram reescritos como "parcial" (condição omitida,
  ambiente errado, número inflado). Sem essa etapa, eles iriam ao advogado como estavam.
- **"Não encontrado" sem dizer onde procurou não vale.** Um verificador precisa conseguir refazer a
  busca.
- **Identificação do controlador costuma divergir** entre termo, site, lojas e CNPJ. É achado, e a
  versão correta é decisão da administração: pergunte, não escolha.
- **Números de produção só por agregado.** Nunca um SELECT que devolva linha com dado pessoal, nem
  "só para conferir".

## Redação

- **IDs provisórios vazam** para o texto (`DAD-03`, `OPE-V02`). O editor procura e troca pelo ID do
  registro.
- **Correções feitas depois deixam texto velho** espalhado em capítulos, anexos e diagramas. Ver
  `correcoes.md`, seção 4, passo 5.
- **Caminhos de papéis de trabalho** (`rel/dossie-x.md:40`) não significam nada para o leitor: o
  gerador do registro os troca por "papel de trabalho: dossiê de ...". Nos capítulos escritos à mão,
  faça o mesmo.
- **Revisão de código citada errada** derruba a conferência por terceiro: confira o hash da revisão
  analisada no git, não de memória.

## Ferramentas

- **Heredoc com barra invertida** corrompe LaTeX e regex (`\r`, `\t`, `\u`). Escreva arquivos com a
  ferramenta de escrita.
- **Script de workflow fora do diretório do projeto** pode não ser legível pela ferramenta de
  workflow por caminho: passe o conteúdo como `script`. Copiar para `.claude/workflows/` do projeto
  só se o usuário aceitar, e sem commit.
- **Caminho absoluto vaza nome de usuário** para o PDF (`C:\Users\<nome>\...`). Evidência cita
  caminho relativo ao repositório; documento externo, pelo nome. O F8 tem um grep para isso.
- **Overleaf gratuito tem 10 s de compilação.** Documento grande passa disso; entregue o PDF pronto e
  explique no LEIA-ME.

## Com o usuário

- Não repreenda o usuário por colar chave no chat: use e siga. Recomende rotação uma vez, no lugar
  certo (o plano de rotação no documento), não a cada mensagem.
- Decisões de negócio (quem é o encarregado, o que apagar, o que publicar) são do usuário: pergunte
  com opções e recomendação, e continue o resto enquanto ele decide.
- Entregue com uma linha dizendo para quem cada volume foi escrito, e ofereça uma mensagem curta para
  o usuário encaminhar os PDFs a quem pediu.
