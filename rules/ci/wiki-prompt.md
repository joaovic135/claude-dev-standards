A versão {{TAG}} do <produto> acabou de ser publicada (anterior: {{ANTERIOR}}). Atualize o wiki do projeto, que está na pasta `.wiki/` deste checkout, para refletir o que mudou nessa versão.

Contexto já preparado em `{{CONTEXTO}}`:

- `changelog.md`: o trecho do CHANGELOG desta versão.
- `commits.txt`: as mensagens completas dos commits; o corpo de cada uma explica o porquê da mudança.
- `arquivos.txt`: os arquivos alterados (A = novo, M = modificado, D = removido).
- `diff.patch`: o diff (pode estar truncado; use `git diff {{ANTERIOR}} {{TAG}} -- <arquivo>` para ver um arquivo inteiro).
- `paginas-afetadas.txt`: as páginas do wiki cujo bloco de fontes cita arquivos alterados.

Páginas afetadas:
{{PAGINAS_AFETADAS}}

Faça, nesta ordem:

1. Leia `.wiki/Como-manter-este-wiki.md` e siga as regras: estrutura da página, português do Brasil, links `[[Título da página]]`, bloco `<!-- fontes -->`, o que nunca entra.
2. Leia `changelog.md` e `commits.txt` para entender o que mudou e por quê.
3. Para cada página afetada: leia a página, leia o diff dos arquivos que ela cita e corrija o que ficou desatualizado (comportamento, nome, caminho, número, prazo, comando). Se a mudança não altera o que a página afirma, não mexa nela.
4. Se um commit introduziu algo que nenhuma página cobre (tela, função, fluxo, regra, decisão, armadilha), acrescente na página mais próxima, pela tabela de `Como-manter-este-wiki.md`. Crie página nova só se o assunto for grande e for durar; nesse caso, acrescente o link em `Home.md` e `_Sidebar.md`, no grupo certo. Decisão de desenho e o motivo vão em `Decisões-e-armadilhas.md`.
5. Atualize o bloco `<!-- fontes -->` das páginas que passaram a depender de arquivos novos, e remova fontes de arquivos apagados.
6. Não edite `Histórico-de-versões.md`: ela é gerada por script.
7. Não edite nada fora de `.wiki/`. Não escreva segredo, chave, e-mail, telefone, documento ou nome de usuário final, conta de teste, nem estado transitório (build que falhou, versão em revisão na loja).
8. No fim, rode `node scripts/wiki/verificar-links.mjs .wiki` e corrija o que ele apontar como erro.

Termine com um resumo curto: cada página alterada e, em uma linha, o que mudou nela.
