---
name: fluxo-de-tarefa
description: Abre e conduz uma tarefa do <produto> pelo fluxo do projeto — branch a partir da stage, PR em rascunho para a stage, issue ligada ao PR e card no quadro "<nome do quadro>" (GitHub Projects), com descrições atualizadas a cada passo e o card andando de Backlog → Fazendo → Em teste → Concluído. Use SEMPRE que o desenvolvedor pedir algo novo que vai mexer no repositório (feature, correção, ajuste de tela, refatoração, documentação, item do backlog), mesmo que ele não fale em branch, issue, PR ou quadro, e também quando ele disser "sobe pra stage", "manda pra teste", "pode mergear" ou "faz a release" de uma tarefa em andamento.
---

# Fluxo de tarefa

O repositório usa GitHub Flow com a `stage` (branch de homologação) no lugar da `develop`: toda
tarefa nasce numa branch saída da `stage`, volta para a `stage` por PR (squash) e chega à `main`
na release (PR `stage → main` com merge commit, ver `docs/release.md`). Cada tarefa tem **uma
issue**, **um PR** e **um card** no quadro <nome do quadro>
(`https://github.com/orgs/<org>/projects/<número do quadro>`). O porquê de cada passo está em
`docs/fluxo-de-trabalho.md`; leia lá quando algo fugir do roteiro.

Colunas do quadro (campo `Status`): **Backlog** → **Fazendo** → **Em teste** (mergeado na
`stage`) → **Concluído** (entrou na `main`). Campos: `Prazo` (data) e `Fase` (`Nova` para pedido
novo; as demais opções são as do projeto). Quadro: organização `<org>`, número
`<número do quadro>`, repositório `<org>/<repo>`.

Use o MCP `github` (`issue_write`, `create_pull_request`, `update_pull_request`,
`projects_write`, `projects_list`, `search_issues`, `sub_issue_write`). Se ele não estiver
conectado, diga isso ao desenvolvedor e aponte a seção "Configurar o MCP do GitHub" de
`docs/fluxo-de-trabalho.md` em vez de pular o fluxo em silêncio.

## 1. Início da tarefa

Faça isto antes de editar qualquer arquivo.

1. **Entenda o pedido** o suficiente para dar um título e escolher o `<tipo>` do Conventional
   Commits. Pergunte, numa única mensagem e deixando claro que é opcional: o **prazo**, o
   **objetivo** (o resultado esperado, em uma frase) e a **prioridade** (Urgent, High, Medium,
   Low). Se o desenvolvedor não responder ou disser para seguir, siga: sem prazo, sem objetivo e
   com prioridade Medium.
2. **Ache ou crie a issue.** Procure no repo (`search_issues` com `repo:<org>/<repo>` e palavras
   do pedido) e no quadro (itens em `Backlog`). Se a tarefa já existe, reutilize essa issue e
   garanta o responsável. Se não existe, crie com `issue_write`:
   - título descritivo, sem prefixo de tipo;
   - `assignees`: quem está fazendo a tarefa (o login do GitHub do desenvolvedor; se não souber,
     pergunte);
   - `type`, `labels` e `issue_fields` pela tabela "Campos preenchidos" abaixo, na mesma chamada;
   - corpo curto no formato abaixo. No começo pode ficar quase vazio; ele cresce depois.

   ```markdown
   ## Objetivo

   <uma frase, se o desenvolvedor deu>

   ## Escopo

   - [ ] <o que se sabe até aqui>

   ## Andamento

   - <data>: branch `<branch>` e PR #<n> abertos.
   ```

3. **Branch ligada à issue.** A branch nasce no GitHub já ligada à issue, como o botão "Create a
   branch" da issue faz; é isso que liga issue e PR na seção "Development" da issue (a palavra
   `Closes` não liga PR que aponta para a `stage`). Do checkout principal:
   `npm run fluxo:branch -- <issue> <tipo>/<issue>-<slug>`. O `<tipo>` é o do Conventional
   Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`); o `<slug>` é curto,
   em minúsculas, com hífen (`fix/58-prazo-no-fuso`). O script cria a branch a partir da `stage`
   usando a credencial do git do desenvolvedor (ou `GITHUB_TOKEN`), e não faz nada se ela já
   estiver ligada.
4. **Worktree.** O checkout principal (`<repo>/`) fica sempre na `stage`; cada tarefa trabalha na
   própria worktree, numa pasta irmã fora do repositório, para tarefas em paralelo não se
   misturarem e para o bundler e o runner de testes não varrerem cópias do código.
   - Veja `git worktree list`. Se já existe uma worktree desta tarefa, use-a.
   - Senão: `git fetch origin <branch>` e
     `git worktree add ../<repo>-worktrees/<tipo>-<issue>-<slug> <branch>`.
   - Daí em diante, todo comando de git, npm e edição usa o caminho da worktree. Para rodar
     build, testes ou o app nela: `npm ci` uma vez e uma cópia do `.env` do checkout principal
     (`cp ../../<repo>/.env .env`; o agente copia sem ler).
   - Worktree de tarefa cuja branch **já foi mergeada** na `stage` (a Action apaga a branch
     remota no merge): remova com `git worktree remove <caminho>` e `git branch -D <branch>`.
   - Trabalho não commitado no checkout principal que pertence a esta tarefa: leve-o para a
     worktree (`git stash push -u` no principal, `git stash pop` dentro dela). Se for de outra
     tarefa, pare e pergunte.
5. **PR em rascunho.** O GitHub não abre PR sem diferença, então, na worktree:
   `git commit --allow-empty -m "chore: inicia #<issue>"` e `git push`. Depois
   `create_pull_request` com `base: stage`, `draft: true`, título em Conventional Commits
   (`feat: exportação de relatório em CSV`) e corpo começando por `Issue: #<n>` numa linha só
   (é essa linha que a Action lê; não cite outras issues como "issue #n" no corpo). O squash do
   merge apaga o commit vazio. Este é o único commit que o fluxo faz sozinho; o resto segue a
   regra do repositório de só commitar quando o desenvolvedor pedir.
6. **Responsável e labels no PR.** `create_pull_request` não aceita responsável nem labels: em
   seguida, `issue_write` com `method: update`, `issue_number: <número do PR>`, `assignees` com o
   mesmo login da issue e as mesmas `labels` da issue.
7. **Cards da issue e do PR.** Os dois entram no quadro <nome do quadro>: `projects_write` →
   `add_project_item` com `item_type: issue` (se a issue ainda não estiver lá) e com
   `item_type: pull_request`. Depois `update_project_item` nos dois: `Status = Fazendo` e `Fase`
   (`Nova` para pedido novo; mantenha a do backlog); na issue, `Prazo` (`YYYY-MM-DD`) se houver.
   A Action move os dois juntos daí em diante.
8. **Relações.** Se a tarefa depende de outra issue aberta, registre o "blocked by":
   `npm run fluxo:depende -- <issue> <issue que bloqueia>`. Se ela é parte de uma tarefa maior,
   ligue como sub-issue (`sub_issue_write`, `method: add`, na issue maior). Sem relação, não
   invente uma.
9. Diga ao desenvolvedor, em uma linha, a branch, a issue e o PR abertos, e comece o trabalho.

### Campos preenchidos

| Campo         | Onde                   | Valor                                                                                                                            |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Assignees     | issue e PR             | quem faz a tarefa                                                                                                                |
| Type          | issue                  | `feat` → `Feature`; `fix` → `Bug`; os demais tipos → `Task`                                                                      |
| Labels        | issue e PR             | `feat` → `enhancement`; `fix` → `bug`; `docs` → `documentation`; `chore`, `refactor`, `test`, `ci`, `perf` → label de mesmo nome |
| Priority      | issue (`issue_fields`) | a que o desenvolvedor disse; sem resposta, `Medium`                                                                              |
| Effort        | issue (`issue_fields`) | sua estimativa pelo escopo: `Low` (horas), `Medium` (um dia), `High` (mais que isso); o desenvolvedor pode trocar                |
| Start date    | issue (`issue_fields`) | o dia de hoje                                                                                                                    |
| Target date   | issue (`issue_fields`) | o prazo, se houver (o mesmo valor vai no `Prazo` do quadro)                                                                      |
| Projects      | issue e PR             | quadro <nome do quadro>: `Status`, `Fase` e, na issue, `Prazo`                                                                   |
| Relationships | issue                  | passo 8, quando houver relação                                                                                                   |
| Development   | issue                  | a branch ligada do passo 3, com o PR dentro                                                                                      |

O "Development" **do PR** fica vazio: o GitHub só o preenche com `Closes #n` em PR para a branch
padrão (`main`) e não tem API para ligar à mão. O vínculo existe pela branch ligada (visível na
issue) e pela linha `Issue: #<n>`. Reviewers e Milestone não são preenchidos.

## 2. Durante a tarefa

- A cada avanço que muda o entendimento (escopo decidido, arquivos afetados, decisão de desenho,
  verificação feita, bloqueio), atualize a seção `Andamento` e as caixas de `Escopo` da issue e o
  corpo do PR (`update_pull_request`). Não espere o fim. O corpo do PR mantém `Issue: #<n>` na
  primeira linha e ganha "O que muda" e "Como testar" quando houver o que dizer.
- Commits só quando o desenvolvedor pedir, em Conventional Commits. Push na própria branch.
- Se a tarefa mudar de natureza (era `fix`, virou `feat`), ajuste o título do PR: é ele que vira
  a mensagem do squash na `stage` e decide a versão na release.

## 3. "Sobe pra stage"

Significa: a tarefa está pronta e vai para teste.

1. `npm run build` uma vez. Falhou: conserte ou mostre o erro e pare.
2. Commit e push do que faltar (com o desenvolvedor tendo pedido, que é o caso aqui).
3. Atualize issue e PR com o resumo final e marque o PR como pronto (`draft: false`).
4. Merge do PR na `stage` com **squash**, usando o título do PR como mensagem.
5. A Action `Projects` move os cards da issue e do PR para **Em teste** e apaga a branch remota.
   Confira no quadro; se o secret `PROJECTS_TOKEN` faltar, mova à mão com `update_project_item` e
   apague a branch.
6. Local: `git worktree remove <caminho-da-worktree>`, `git branch -D <branch>` (o squash não
   deixa a branch como ancestral da `stage`, por isso `-D`) e, no checkout principal, `git pull`
   na `stage`.

## 4. Release

Segue `docs/release.md` (PR `stage → main` com merge commit). Quando ele entra na `main`, a Action
move tudo que estava em **Em teste** para **Concluído** e fecha as issues. Sem a Action, faça isso
à mão no fim da release.

## Casos

- **Outra pessoa faz a tarefa:** ela é a responsável na issue; você não se atribui.
- **Correção urgente direto na `main`:** branch ligada saída da `main`
  (`npm run fluxo:branch -- <issue> fix/<issue>-<slug> main`), worktree dela e PR para a `main`
  com `Issue: #<n>`; no merge a Action leva os cards a Concluído. Depois faça o back-merge na
  `stage`.
- **Pedido sem mudança no repositório** (pergunta, análise, consulta a painel): não abre branch,
  issue nem card.
- **Item novo descoberto no meio do trabalho** (bug lateral, dívida): crie a issue com o card em
  Backlog e siga a tarefa atual; não misture no mesmo PR.
