# Método da trilha LGPD

Como transformar um repositório e um banco em um registro de achados que resiste a um advogado
adverso. O método tem cinco etapas, e cada uma existe para pegar um tipo de erro que a anterior deixa
passar:

1. **Análise por dimensão** (em paralelo): cobertura. Cada analista fica num tema e vai fundo.
2. **Verificação independente** (uma por dossiê): erro de fato, estado desatualizado, exagero.
3. **Refutação adversarial** (achados críticos e altos): o achado grave que vai para o advogado tem
   de sobreviver a alguém tentando derrubá-lo.
4. **Crítico de completude + apurações complementares**: o que um especialista perguntaria e ninguém
   respondeu; contradições entre dossiês.
5. **Consolidação**: registro mestre com IDs definitivos, matriz de conformidade, perguntas à
   administração e quesitos ao consultor.

## Sumário

1. `rel/contexto.md` — o bloco que todo agente lê
2. Critério de gravidade
3. Estrutura do dossiê
4. As dimensões
5. Prompt do analista
6. Prompt do verificador
7. Prompt do refutador
8. Crítico de completude e apurações complementares
9. Consolidação: registro mestre, matriz, perguntas e quesitos
10. Esquemas de saída estruturada
11. Consultas agregadas em produção (Postgres)

## 1. `rel/contexto.md` — o bloco que todo agente lê

Escreva uma vez, no início, e faça todo prompt começar com "Leia `rel/contexto.md` inteiro antes de
começar". Isso evita 40 cópias divergentes das regras. Conteúdo:

```markdown
# Contexto da análise

## O sistema

Nome, o que faz, plataformas, pilha, empresa (razão social, marca, CNPJ, cidade), o contrato ou
termo que rege a relação com o usuário (caminho no repositório ou documento entregue pelo usuário).

## Titulares e papéis

- Quem usa o sistema (perfis com login) e quem são os titulares. Diga explicitamente se o titular é
  o próprio usuário (autosserviço: ele se cadastra, aceita termos, encerra a conta) ou se o sistema é
  operado por uma equipe sobre titulares que não o usam (pacientes de clínica, alunos, funcionários,
  clientes de um escritório). No segundo caso, informação ao titular, consentimento e direitos passam
  por papel, balcão, site ou atendimento, e não por tela.
- Obrigações legais de guarda que limitam a eliminação (prontuário, documentos fiscais e
  trabalhistas, registros de acesso), como hipótese a confirmar na base legal.
- Quem pede o relatório e em que papel (a própria empresa; desenvolvedor contratado; fornecedor de
  sistema usado por vários clientes, cada um controlador dos próprios dados). O papel de cada um é
  hipótese para parecer.
- Modelo de autorização: no banco (RLS), na aplicação (decoradores, middleware, filtros por
  usuário) ou misto. Ausência de RLS não é achado por si; o achado é dado entregue a quem não
  deveria recebê-lo.

## Os relatórios

(A) relatório técnico de proteção de dados à luz da LGPD, lido por jurista sênior e encaminhado a
consultoria; precisão acima de tudo: um fato errado, uma conformidade afirmada sem prova ou uma
violação afirmada sem prova desacreditam o documento inteiro. (B) relatório de engenharia,
qualidade e testes, que também serve de guia de boas práticas.

## Regras de trabalho

- Repositório em <caminho> (no Bash: <caminho POSIX>), ramo <ramo>, revisão <hash>. NÃO edite o
  repositório, salvo quando a sua tarefa disser. Não faça commit.
- Hoje é <data>.
- Evidência: toda afirmação de fato cita arquivo:linha (relativo à raiz), ou a consulta e o
  resultado numérico, ou URL com data de acesso. Marque [VERIFICADO] (viu no código, no banco ou na
  página) ou [INFERIDO] (dedução; diga de quê). "Não encontrado" diz onde procurou. Documento fora
  do repositório (enviado pelo usuário): cite pelo nome e data, não pelo caminho local, que expõe o
  nome de usuário da máquina. Documentos em
  docs/ podem estar desatualizados: confirme o estado ATUAL no código.
- Não tire conclusão jurídica: descreva o fato e indique dispositivos "possivelmente relacionados"
  como hipótese, com "ponto para parecer jurídico" quando a qualificação depender de interpretação.
- Produção: <identificador>: SOMENTE LEITURA, só metadados e agregados (catálogo, policies,
  configuração, contagens, tamanhos, datas mínima e máxima). Proibido em produção: escrita, DDL,
  qualquer SELECT que devolva linha com dado pessoal, subir o sistema, rodar testes, migrações ou
  scripts do repositório apontando para ela, tentar autenticar ou sondar rota autenticada. Requisição
  pública: só GET e HEAD.
- Homologação: <identificador e conteúdo | não existe>. Se tiver dado real, vale como produção.
- Instância descartável (conteúdo, testes, capturas): <como subir: docker compose, banco local
  vazio + migrações + semente fictícia em rel/semente.*; ou a homologação, se só tiver dado
  sintético>. ANTES de rodar teste, servidor ou script do repositório, defina o banco no próprio
  comando (variável de ambiente explícita) e confirme o alvo mostrando só host e nome do banco:
  arquivos de configuração podem apontar para produção, e fixtures de teste costumam apagar tabelas.
  Na dúvida sobre o alvo, não rode.
- Como consultar o banco de produção: <comando exato, com proteção mecânica, não só disciplina:
  papel somente leitura; sessão em modo somente leitura (Postgres:
  PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=15000'); credencial fora da
  linha de comando (pg_service.conf/.pgpass, CLI já autenticada) para o DSN nunca aparecer; tempo por
  chamada; erros transitórios e quantas vezes repetir; como agrupar consultas>.
- Segredos: nunca imprima nem grave chave, token, senha, service role, SECRET_KEY, DSN completo.
  Segredo versionado (em arquivo ou no histórico do git): registre arquivo:linha e o NOME da
  variável, nunca o valor. Não leia .env*, pastas de configuração local (instance/, config/local*),
  dist/, build/, node_modules/, vendor/, venv/, .venv/, arquivos de lock, dumps de banco (*.dump,
  *.backup, *.sql com dados) nem pastas de upload. Arquivo com dado real no repositório (exame,
  planilha, fixture com nome real): identifique só o tipo e registre como achado.
- Shell: <SO e shell; manhas de caminho e de aspas>.
- Diretório de trabalho: <rel/> (já existe). Use-o também para temporários.
- Grave o arquivo de entrega cedo e atualize à medida que avança: interrupção não pode perder trabalho.
- Economia: Grep e leitura de trechos em vez de arquivos inteiros; agrupe consultas; reaproveite
  arquivos parciais íntegros de execução anterior, conferindo antes de confiar.
- Português do Brasil, registro técnico-formal, frases diretas, sem floreio e sem autoelogio.
```

## 2. Critério de gravidade

Gravidade técnica, não jurídica. Cole este texto em todo prompt que classifica:

> **crítica** = exposição efetiva ou facilmente explorável de dado pessoal sensível ou em massa, ou
> ausência total de requisito legal central com titulares já afetados em produção; **alta** = lacuna
> relevante de requisito da LGPD, ou falha de segurança envolvendo dado pessoal explorável em
> condições realistas; **média** = lacuna parcial, risco condicionado ou fragilidade probatória;
> **baixa** = melhoria ou hardening; **informativa** = registro sem risco próprio.

## 3. Estrutura do dossiê

Cada analista grava `rel/dossie-<chave>.md`:

1. Escopo e método (o que examinou, como, limites).
2. Fatos apurados (seções temáticas; tabelas quando ajudam; cada fato com evidência e marcação).
3. Pontos de conformidade demonstrável (o que o sistema faz bem, com prova). Um relatório só de
   problemas parece parcial; o que funciona, provado, dá credibilidade ao resto.
4. Achados, cada um com: ID provisório `<PREFIXO>-nn`, título, descrição factual, evidências, quem é
   afetado e como (cenário concreto de dano ou de questionamento), dispositivos possivelmente
   relacionados (hipótese), gravidade com justificativa, recomendação técnica objetiva, e o que
   depende de parecer ou de informação da administração.
5. Perguntas que só a administração pode responder.
6. Pistas para outras dimensões.

Tamanho: denso, 1.500 a 3.500 palavras.

## 4. As dimensões

Nove dimensões cobrem um aplicativo típico. **Ajuste ao sistema:** sem app nas lojas, a dimensão
`lojas` sai e as declarações públicas (site, aviso de privacidade) vão para `transparencia`; sem IA,
as decisões automatizadas vão para `direitos`; um domínio com prontuário, pagamentos, biometria ou
geolocalização merece dimensão própria (no workflow, passe `{key, prefixo, titulo, web}` em
`dimensoes` e escreva `rel/foco-<key>.md`). Mantenha cada dimensão com uma pergunta central clara e
sem sobreposição grande.

**Titular que não usa o sistema.** As descrições abaixo nasceram de um app de autosserviço, em que o
titular é o usuário. Quando o sistema é operado por uma equipe sobre titulares que não o acessam
(clínica, escola, RH, escritório), reescreva o foco em `rel/foco-<dimensão>.md`:

- `transparencia`: o que o titular recebe em papel, no balcão, no site ou por mensagem automática, e
  o que o sistema registra disso (marca de "termo assinado", versão, data, quem colheu);
- `direitos`: como a equipe atende o pedido do titular (consultar, exportar, corrigir, anonimizar,
  eliminar), com que ferramenta e registro; guarda obrigatória que impede eliminar;
- `dados` e `terceiros`: o dado sensível pode ser o núcleo do sistema, não um acidente;
- os perfis com login (funcionários) também são titulares: registros de acesso, trilha de auditoria.

Os exemplos de "onde procurar" cobrem pilhas comuns; use os que existirem no projeto.

### dados — Inventário de dados pessoais e armazenamento (prefixo DAD)

Pergunta: que dado pessoal o sistema guarda ou materializa, no servidor e no aparelho?

- **Banco:** para cada tabela/coleção (fonte do schema: migrações, ORM, tipos gerados): colunas com
  dado pessoal; categoria (identificação, contato, profissional, documento, financeiro, técnico ou de
  dispositivo, conteúdo, saúde, de terceiros); titular (usuário, terceiro, pessoal interno); origem
  (digitado, recebido de integração, gerado); código que grava; quem lê e altera (resuma a regra real
  de acesso: policies de RLS, regras do Firestore, permissões do ORM, middleware); o que acontece na
  exclusão da conta (cascade, resíduo); volume em produção (contagens; mínimo e máximo de criação).
  Inclua as tabelas do provedor de autenticação, logs de auditoria, filas e respostas de HTTP
  guardadas, jobs agendados.
- **Arquivos:** buckets, público ou privado, estrutura de caminho, tipos de documento exigidos,
  limites, validade de URL assinada, regras de acesso.
- **Aparelho e navegador:** o que fica em AsyncStorage/localStorage/IndexedDB/cookies (sessão, cache
  persistido de consultas, preferências), o que é limpo no logout e na exclusão, uso ou ausência de
  armazenamento seguro (Keychain, Keystore), backup do sistema (allowBackup).
- **Derivados:** logs, métricas, tokens de push, identificadores de dispositivo.
- Entregue a **tabela-mestre de inventário**, no espírito do registro do art. 37: uma linha por
  conjunto de dados.

### operadores — Compartilhamento e transferência internacional (OPE, precisa de web)

Pergunta: quem mais recebe dado pessoal, o quê, onde, e o que acontece lá quando o titular sai?

- Para cada terceiro (banco gerenciado, autenticação, armazenamento, funções; analytics; CRM e
  mensageria; suporte; monitoramento de erro; provedores de IA; push; e-mail transacional;
  hospedagem; sistemas internos da empresa; build e CI; lojas; links externos), ache no código:
  campos enviados (nome e origem), ponto de envio (arquivo:linha), condição (plataforma, ambiente,
  login, opt-in), identificador que liga o titular (uuid, e-mail, CPF), recursos de coleta ligados
  (autocapture, gravação de sessão, telas, breadcrumbs), o que é mascarado, e o que acontece no logout
  e na exclusão (reset, delete na API?).
- Fontes: manifesto de dependências, configuração do app, variáveis de ambiente **públicas** (nomes,
  não valores), SDKs inicializados, funções de servidor.
- Localização: região do projeto de banco e dos serviços (configuração), sede e subprocessadores
  segundo a documentação pública oficial de cada fornecedor (WebFetch; URL e data de acesso; não
  invente o que não achar).
- Entregue a **matriz de operadores**: fornecedor, serviço, papel provável (operador, suboperador,
  controlador independente — hipótese), dados enviados, finalidade, país ou região, base técnica da
  afirmação, mecanismo de transferência divulgado pelo fornecedor (não verificado contratualmente),
  como excluir o titular lá. Sinalize dado que vai e talvez não devesse (e-mail em `identify`,
  identificador de processo em URL ou evento, CPF em atributo).

### transparencia — Transparência, bases aparentes, consentimento e registro do aceite (TRA, web)

Pergunta: o que o titular é informado, quando, e que registro fica?

- **Termo ou contrato:** texto integral, tela de aceite, caminho de gravação. Compare o que o texto
  promete registrar (data, IP, identificação) com o que o sistema registra de fato; versionamento
  (texto mudou → novo aceite?); versão aceita recuperável; usuário consegue reler; horário vem do
  servidor?
- **Aviso de privacidade:** procure em telas, links, rodapés, configurações, páginas públicas, fichas
  das lojas, site institucional. Se existir, compare o que declara com o que o código faz.
- **Controlador e encarregado** (art. 41): o sistema informa quem são e um canal para o titular?
- **Escolhas:** textos de permissão do sistema operacional e quando são pedidos; opt-in/opt-out de
  analytics, monitoramento, marketing, push; aviso de cookies na web; descadastro de e-mail.
- **Coleta mínima:** cada campo do cadastro e para que é usado no código (campo sem uso é fato).
- **Idade:** barreira ou declaração.
- Relacione aos arts. 6º, 7º, 8º, 9º, 10, 11 e 41 como hipótese. Não classifique a base legal:
  diga qual base a operação **aparenta buscar** e deixe a qualificação para parecer.

### direitos — Direitos do titular, retenção e eliminação (DIR)

Pergunta: cada direito do art. 18 é atendido como, e quanto tempo cada dado vive?

- **Encerramento de conta** (ou, sem autosserviço, o atendimento do pedido de eliminação pela
  equipe) de ponta a ponta: fluxo, janela de arrependimento, eliminação definitiva (job,
  agendamento), o que é apagado, o que permanece e onde (sistemas internos, terceiros, backups, logs
  de autenticação, respostas HTTP guardadas). Jobs podem estar no banco (pg_cron) ou fora dele
  (crontab, Celery, APScheduler, Sidekiq, agendador da nuvem, Procfile): procure no repositório e na
  configuração de deploy. Confirme em produção por metadados o que for consultável (o job existe?
  quantas execuções? quantas contas pendentes, a mais antiga?).
- **Guarda obrigatória:** dado que a lei manda manter (prontuário, fiscal, trabalhista, registros de
  acesso) e como o sistema concilia isso com a eliminação. Hipótese, com a norma da base legal.
- **Acesso, correção, portabilidade:** o que o titular vê e edita; via para cópia completa.
- **Revogação e oposição:** desligar analytics, marketing, push; efeito nos terceiros.
- **Retenção:** prazo definido para algo? Idade do dado mais antigo por tabela; registros de acesso
  (art. 15 do Marco Civil, só como fato e ponto para parecer).
- **Aparelho:** o que sobra depois do logout e da exclusão.
- **Arquivos:** substituição, rejeição e exclusão (o antigo é apagado?).
- Entregue a **matriz do art. 18** (incisos I a IX, parágrafos pertinentes e art. 19): como é
  atendido hoje (no app, por pedido, não disponível), evidência, lacuna.

### seguranca — Medidas de segurança e incidentes, arts. 46 a 49 (SEG)

Pergunta: o que protege o dado pessoal hoje, com prova, e o que está frágil?

- Autenticação (cadastro aberto ou fechado, senha, recuperação, limites de taxa **medidos**, sessão);
  autorização (regra de acesso em toda tabela com dado pessoal, **testada com o ator não
  autorizado**; transições de estado; arquivos); segredos (onde vivem; varredura do bundle web e do
  binário mobile); transporte; armazenamento no aparelho; autenticação de webhooks e funções
  (comparação em tempo constante); registro e monitoramento; cadeia de suprimentos (actions pinadas
  por SHA, permissões mínimas, auditoria de dependências); backup e restauração (provado ou só
  configurado?); disponibilidade sob carga; resposta a incidentes (plano, contato, critério de
  comunicação; registre a ausência); acesso administrativo (quem tem chave privilegiada e painel).
- **Aplicação renderizada no servidor** (Flask, Django, Rails, Laravel, Spring MVC): modo de
  depuração em produção (debugger exposto); chave de sessão versionada ou no histórico do git; flags
  do cookie de sessão (Secure, HttpOnly, SameSite) e se a sessão fica no cliente; CSRF; escape de
  template desligado (`|safe`, `raw`, `html_safe`); SQL montado por concatenação; upload (nome,
  tipo, tamanho, onde é servido e se checa quem pede); IDOR em rotas com identificador
  (`/paciente/<id>`); painel administrativo exposto; backups no próprio host; acesso SSH e a quem.
- Use os resultados de testes já registrados no repositório e diga de onde vêm. Se não houver teste
  de autorização, a análise estática (rota por rota, quem pode chamar) é a evidência; sonda dinâmica
  só na instância descartável ou em homologação sem dado real, nunca em produção, e limite de taxa só
  se o usuário autorizar (em produção, medir limite parece força bruta).
- Para cada fragilidade aberta: expõe dado pessoal? de quem? em que condição? Reflita o estado ATUAL.

### ia — Inteligência artificial e decisões automatizadas (IA, web)

- Cada uso de IA: fornecedor e modelo reais (no código, não no doc), o que vai a cada chamada
  (mensagem, histórico, perfil, base de conhecimento), o que não vai, se a conversa é guardada (banco,
  aparelho, logs), limites e cota, autenticação, o que o usuário é informado (está falando com IA? para
  onde vai o que escreve?). Política de retenção e treino do fornecedor na documentação oficial (URL e
  data).
- Conteúdo gerado exibido ao usuário: quem produz, com que grau de automação.
- **Decisões automatizadas**: toda decisão sem intervenção humana que afete o titular (expiração,
  bloqueio, aprovação/rejeição, ordenação, pontuação, perfilamento), com o mecanismo. Quais poderiam
  atrair o art. 20, como hipótese.
- Governança de qualidade: avaliações, regras do prompt sobre dados pessoais e aconselhamento.

### terceiros — Dados de terceiros, dados sensíveis e sigilo (TER)

Pergunta: onde aparecem dados de quem **não** é usuário (clientes do usuário, pacientes, partes de
processo, dependentes) e dados sensíveis?

- Colunas e payloads de conteúdo; textos de notificação e push (o que aparece na tela bloqueada);
  respostas de chat; eventos de analytics com identificadores; mensagens pré-preenchidas ao suporte;
  breadcrumbs de monitoramento; cache persistido; capturas e alternador de apps; logs.
- Dimensione **sem expor conteúdo**: exemplos do repositório para o **tipo** de informação; em
  produção só contagens (percentual de campo preenchido; quantas linhas casam com termos genéricos de
  saúde por expressão regular, devolvendo só o número). Nunca devolva o texto. Se o dado sensível é o
  núcleo do sistema (prontuário, exames, biometria), não há o que "detectar": conte volumes por tipo
  de registro e descreva quem acessa cada tipo.
- Grupos que pedem cuidado próprio: crianças e adolescentes (art. 14), responsáveis legais, terceiros
  citados (profissionais que encaminham, contatos de emergência), operadoras de planos e convênios
  (art. 11, §§ 4º e 5º, conferidos na base legal).
- Descreva a cadeia por onde o conteúdo passa e quem lê em cada ponto. Dispositivos (art. 5º, II;
  art. 11; art. 6º, III) e sigilos profissionais do setor como pontos para parecer.

### lojas — Lojas, permissões e declarações públicas (LOJ, web)

- Google Play (seção Segurança dos dados, política vinculada) e App Store (rótulos de privacidade,
  privacy manifest, textos de permissão, rastreamento): compare item a item com SDKs e dados reais.
- Exigência das lojas de exclusão de conta iniciável no app e por link web.
- Permissões declaradas × usadas; permissões sem justificativa.
- Página pública de download, links universais, deep links.
- Registre URL e data de tudo da web; página ilegível: diga, não suponha.

### web — Versão web, armazenamento no navegador e exposição pública (WEB, web)

- Domínios de produção e homologação; só GET/HEAD públicos: cabeçalhos de segurança (HSTS, CSP,
  X-Frame-Options, Referrer-Policy, Permissions-Policy, Cache-Control), robots e indexação, o que é
  servido sem login, homologação exposta?
- Armazenamento no navegador e aviso de cookies.
- Tokens em URL (recuperação de senha, callbacks, links mágicos): vazamento por Referer, histórico,
  analytics.
- CORS e exposição de funções; chaves públicas no bundle (o que é público por desenho e o que não
  deveria).
- Terceiros carregados na página. Sem varredura agressiva, sem tentar autenticar em produção.

## 5. Prompt do analista

```
Leia <rel>/contexto.md inteiro antes de começar.
Sua dimensão: <título>. As outras, tratadas por outros analistas em paralelo, são: <lista>. Fique na
sua, e anote na seção 6 do dossiê o que encontrar que pertença a outra.
<foco da dimensão, da seção 4, adaptado ao sistema: nomes de tabelas, arquivos e serviços reais>
Entrega: grave <rel>/dossie-<chave>.md com a estrutura: <seção 3>. <critério de gravidade>
Depois devolva o resultado estruturado (esquema ACHADOS): resumo (até 150 palavras), caminho do
dossiê e a lista de achados (os mesmos da seção 4 do dossiê, resumidos; em evidencias, as
referências arquivo:linha ou a consulta).
```

Dimensões marcadas "web" precisam de WebFetch/WebSearch: use um agente que os tenha.

## 6. Prompt do verificador

```
Leia <rel>/contexto.md. Você é o verificador independente do dossiê "<título>", em
<rel>/dossie-<chave>.md. Parta do princípio de que ele pode conter erros. Achados do analista:
<JSON dos achados>
Para CADA achado e cada ponto de conformidade, refaça a verificação na fonte: abra o arquivo e a
linha, rode de novo a consulta, reabra a URL. Procure: evidência que não diz o que o dossiê afirma;
estado desatualizado (já corrigido no código, ou o contrário); exagero ou subavaliação de gravidade;
afirmação jurídica apresentada como fato; números errados. Depois procure omissões com buscas
próprias e acrescente o que o analista não viu.
Corrija o dossiê no próprio arquivo e acrescente ao final "## Verificação independente" com o que
confirmou, corrigiu, rebaixou, refutou e acrescentou, cada item com a nova evidência. <gravidade>
Devolva (esquema VERIFICACAO): um veredito por achado (mesmo id) com a gravidade final, e os achados
novos (ids <PREFIXO>-Vnn).
```

A seção "Verificação independente" **prevalece** sobre o corpo do dossiê nas etapas seguintes.

## 7. Prompt do refutador

Um refutador por achado crítico ou alto (após a verificação), **no máximo três por dimensão**,
críticos primeiro. O excedente fica com a verificação do dossiê e isso é registrado. O limite existe
por custo; com orçamento folgado, refute todos os graves.

```
Leia <rel>/contexto.md. Tente REFUTAR o achado abaixo, da dimensão "<título>" (dossiê em
<rel>/dossie-<chave>.md). Ele vai constar, como grave, de um relatório que um advogado adverso
poderia ler: se houver exagero, erro de fato, condição omitida ou correção já aplicada, é agora que
se descobre.
<JSON do achado>
Verifique a evidência na fonte, por conta própria, sem confiar no dossiê. Vereditos: confirmado
(sustenta integralmente), parcial (sustenta com ressalvas; reescreva), refutado (não se sustenta;
explique). Na dúvida entre confirmado e parcial, escolha parcial. Escreva o enunciado final em 2 a 6
frases que você assinaria: só o que a evidência prova, com números exatos, condições e ambiente
(produção, homologação, build), sem qualificação jurídica. <gravidade>
Grave em <rel>/refutacoes/<PREFIXO>-<n>.md (achado, o que verificou e como, veredito, enunciado
final, ressalvas) e devolva o resultado estruturado (esquema REFUTACAO).
```

## 8. Crítico de completude e apurações complementares

Crítico (um agente, depois de todas as dimensões):

```
Leia <rel>/contexto.md. Você é o crítico de completude da trilha LGPD. Leia TODOS os dossiês em
<rel>, as refutações em <rel>/refutacoes e <rel>/base-legal.md. Pergunte-se: o que um advogado
especialista em proteção de dados perguntaria e não está respondido? Que fluxo de dado pessoal não foi
seguido até o fim? Que afirmação ficou sem prova? Que tema da LGPD (princípios do art. 6º, bases,
direitos, compartilhamento, transferência internacional, segurança, incidente, governança do art.
50, registro do art. 37, relatório de impacto do art. 38, encarregado, crianças, decisões
automatizadas, término do tratamento) não tem fato apurado? Há contradição entre dossiês?
Liste no máximo 8 lacunas APURÁVEIS pelo repositório, pelos bancos (mesmas regras) ou por páginas
públicas, da mais importante para a menos. O que só a administração responde não entra aqui.
Grave também <rel>/lacunas.json e devolva (esquema LACUNAS).
```

Uma apuração complementar por lacuna, em paralelo:

```
Leia <rel>/contexto.md. Apuração complementar número <i> da trilha LGPD. Tema: <tema>. Por que
importa: <por_que_importa>. Como apurar: <como_apurar>.
Apure com o mesmo padrão de evidência, verifique você mesmo o que afirmar, e grave
<rel>/complementos/complemento-<i>.md (tema; fatos; achados com id COM<i>-nn, gravidade justificada e
recomendação; contradições resolvidas, dizendo qual versão vale e por quê; o que ficou sem
resposta). <gravidade>
```

Complementos não passam por segunda verificação; o registro marca `verificacao: nao_reverificado`.

## 9. Consolidação: registro mestre, matriz, perguntas e quesitos

Um agente (contexto grande; use o modelo mais capaz):

```
Leia <rel>/contexto.md. Você consolida a trilha LGPD. Leia todos os dossiês (a seção "Verificação
independente" prevalece sobre o corpo), todas as refutações (o enunciado final prevalece sobre o
achado original), os complementos (as resoluções de contradição prevalecem) e a base-legal.md.
Produza em <rel>:
1. registro-achados-lgpd.json e registro-achados-lgpd.md: o registro mestre. Una duplicatas entre
   dimensões; descarte o refutado; use o enunciado final das refutações; IDs definitivos LGPD-01 em
   diante, ordenados por gravidade (crítica, alta, média, baixa, informativa) e, dentro dela, por
   tema. No JSON, uma lista de objetos com estes campos exatos:
   id, titulo, tema, enunciado (o fato verificado, 2 a 6 frases, com números e ambiente),
   evidencias (lista: arquivo:linha, consulta ou URL com data), titulares_afetados,
   dispositivos (lista; só dispositivos presentes na base-legal.md, como hipótese),
   gravidade (critica|alta|media|baixa|informativa),
   verificacao (refutado_e_confirmado|refutado_parcial|verificador|nao_reverificado),
   recomendacao, esforco (baixo|medio|alto), dependencias (lista: engenharia|administracao|
   juridico|fornecedor), origem (lista dos ids provisórios), capturas (ids do catálogo de telas que
   ilustram o achado, quando houver).
   tema é um de: transparencia, bases_legais, consentimento, direitos_do_titular,
   retencao_e_eliminacao, compartilhamento, transferencia_internacional, seguranca, incidentes,
   dados_sensiveis_e_terceiros, inteligencia_artificial, governanca, lojas_e_declaracoes,
   aparelho_e_web, criancas_e_adolescentes, ou uma chave de <rel>/temas.json, se existir.
   O .md apresenta o mesmo conteúdo em fichas legíveis.
2. matriz-conformidade.md: para cada tema (princípios do art. 6º um a um; bases legais;
   consentimento; transparência do art. 9º; dados sensíveis; direitos do art. 18 inciso a inciso;
   término e eliminação; compartilhamento e operadores; transferência internacional; registro das
   operações; relatório de impacto; encarregado; segurança; incidentes; boas práticas e governança;
   decisões automatizadas; crianças e adolescentes): situação (atende com evidência | atende
   parcialmente | não atende | não se aplica | depende de informação externa ao código), evidência e
   achados relacionados.
3. perguntas-administracao.md: o que só a administração responde, unificado e agrupado (identidade e
   porte do controlador; contratos com fornecedores; pessoas e acessos; processos internos; histórico
   de incidentes; relações institucionais).
4. quesitos-juridicos.md: quesitos ao consultor, agrupados por tema, cada um com o fato técnico que o
   motiva (com o id LGPD-nn) e a pergunta precisa e respondível.
Não acrescente fato novo sem evidência. Divergência não resolvida: resolva na fonte e registre.
Devolva a contagem por gravidade e os dez principais.
```

Depois, confira o JSON com `node <skill>/scripts/gerar_registro.mjs --registro ... --saida <rel>/conferencia.tex`:
o script recusa id repetido e gravidade inválida.

**Bom quesito:** pergunta fechada o bastante para ser respondida, aberta o bastante para não induzir a
resposta, ancorada num fato do registro. Ruim: "O app está conforme a LGPD?". Bom: "O tratamento do
resumo do processo, que pode conter dado de saúde do periciando (LGPD-14), encontra amparo no art.
11, II, 'd', considerando que a empresa não é parte no processo?".

## 10. Esquemas de saída estruturada

Para workflows ou agentes com saída tipada.

```js
const ACHADO = {
  type: "object",
  properties: {
    id: { type: "string" },
    titulo: { type: "string" },
    descricao: { type: "string" },
    evidencias: { type: "string" },
    gravidade: {
      type: "string",
      enum: ["critica", "alta", "media", "baixa", "informativa"],
    },
    tipo: {
      type: "string",
      enum: ["lacuna", "risco", "conformidade", "duvida_juridica"],
    },
    artigos: { type: "string" },
    recomendacao: { type: "string" },
  },
  required: ["id", "titulo", "descricao", "evidencias", "gravidade", "tipo"],
};
const ACHADOS = {
  type: "object",
  properties: {
    resumo: { type: "string" },
    dossie: { type: "string" },
    achados: { type: "array", items: ACHADO },
  },
  required: ["resumo", "dossie", "achados"],
};
const VERIFICACAO = {
  type: "object",
  properties: {
    resumo: { type: "string" },
    vereditos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          veredito: {
            type: "string",
            enum: ["confirmado", "corrigido", "rebaixado", "refutado"],
          },
          gravidade_final: {
            type: "string",
            enum: [
              "critica",
              "alta",
              "media",
              "baixa",
              "informativa",
              "removido",
            ],
          },
          nota: { type: "string" },
        },
        required: ["id", "veredito", "gravidade_final", "nota"],
      },
    },
    novos_achados: { type: "array", items: ACHADO },
  },
  required: ["resumo", "vereditos", "novos_achados"],
};
const REFUTACAO = {
  type: "object",
  properties: {
    veredito: { type: "string", enum: ["confirmado", "parcial", "refutado"] },
    enunciado_final: { type: "string" },
    evidencia_verificada: { type: "string" },
    ressalvas: { type: "string" },
    gravidade_final: {
      type: "string",
      enum: ["critica", "alta", "media", "baixa", "informativa", "removido"],
    },
  },
  required: [
    "veredito",
    "enunciado_final",
    "evidencia_verificada",
    "gravidade_final",
  ],
};
const LACUNAS = {
  type: "object",
  properties: {
    lacunas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tema: { type: "string" },
          por_que_importa: { type: "string" },
          como_apurar: { type: "string" },
        },
        required: ["tema", "por_que_importa", "como_apurar"],
      },
    },
  },
  required: ["lacunas"],
};
```

## 11. Consultas agregadas em produção (Postgres)

Padrões que respondem perguntas de LGPD sem devolver dado pessoal. Agrupe várias numa só chamada com
`json_build_object` para economizar tempo de conexão. Os nomes (`public.profiles`, `cron.job`,
`storage.buckets`) são de um projeto Supabase: troque pelos do sistema analisado.

Proteção mecânica para Postgres comum, com papel somente leitura e credencial em
`pg_service.conf`/`.pgpass` (o usuário configura; o DSN nunca aparece no comando):

```bash
PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=15000' \
  psql "service=<servico_somente_leitura>" -X -A -t -c "<sql>"
```

Temas novos (dimensão criada para o sistema): grave `rel/temas.json` com `{"chave": "Rótulo"}`; a
consolidação usa as chaves e o `gerar_registro.mjs --temas rel/temas.json` usa os rótulos.

```sql
select json_build_object(
  'perfis', (select count(*) from public.profiles),
  'mais_antigo', (select min(created_at) from public.profiles),
  'desativados', (select count(*) from public.profiles where deleted_at is not null),
  'desativado_mais_antigo', (select min(deleted_at) from public.profiles)
)
```

```sql
select tablename, policyname, cmd, roles, qual is not null as tem_using, with_check is not null as tem_check
from pg_policies where schemaname = 'public' order by 1, 2
```

```sql
select c.relname, c.relrowsecurity as rls_ligada
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1
```

```sql
select k, count(*) from public.tabela, jsonb_object_keys(coluna_jsonb) k group by k order by 2 desc
```

```sql
select count(*) filter (where coluna::text ~* '(diagn|cid|laudo|doen|sa[uú]de)') as com_termo_de_saude,
       count(*) as total
from public.tabela
```

Também úteis: `information_schema.columns` (colunas por tabela), `pg_constraint` com `confdeltype`
(o que cascateia na exclusão), `cron.job` e `cron.job_run_details` (jobs e execuções),
`storage.buckets` (público ou privado), `pg_stat_user_tables` (volume aproximado). Em outros bancos,
use o equivalente de catálogo e agregados: o princípio é o mesmo.
