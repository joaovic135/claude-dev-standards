# Skills

## relatorios-lgpd-engenharia

Produz, a partir do código-fonte, do banco e das páginas públicas de um sistema, dois relatórios
formais em LaTeX/PDF:

- **Volume I, proteção de dados:** inventário de dados e operadores, direitos dos titulares,
  segurança, achados verificados e refutados, quesitos para o jurídico, plano de adequação. Não dá
  parecer; descreve fatos com evidência conferível.
- **Volume II, engenharia, qualidade e testes:** arquitetura, regras de codificação, catálogo de
  testes com nomes e resultados, avaliações de usabilidade (GenderMag e persona de domínio), uso
  de IA no desenvolvimento, guia prático.

Entrega dois PDFs, dois pacotes para Overleaf e os papéis de trabalho (dossiês, refutações,
registro de achados em JSON).

Três escolhas de método: passo zero obrigatório com o usuário (volumes, papel jurídico de quem
pede, titulares, ambientes); verificação adversarial de cada achado por um agente que tenta
refutá-lo; separação entre agentes de análise (produzem dossiês) e de redação (escrevem capítulos a
partir deles).

A execução de referência usou cerca de 60 agentes de análise e 17 de redação; a skill avisa o
custo e combina o escopo antes de gastar qualquer agente. Foi generalizada com um dry-run numa
stack diferente, mas ainda não teve uma execução completa fora do projeto de origem.

### Instalar

- Como pasta: copie `relatorios-lgpd-engenharia/` para `~/.claude/skills/`.
- Como pacote: importe `relatorios-lgpd-engenharia.skill` pelo Claude Code.

É uma skill pessoal, não do projeto: o agente só a carrega quando o pedido é relatório de proteção
de dados, de engenharia ou de testes.

### Como foi criada

Com a skill de criação de skills: capturar a intenção a partir do histórico da própria execução,
escrever o rascunho, rodar casos de teste com e sem a skill, comparar, e então o dry-run em outra
stack para tirar do texto tudo o que era específico do projeto de origem.
