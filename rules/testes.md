# Testes

Teste existe onde errar é caro; porcentagem de cobertura não é o objetivo. O recorte sob cobertura
é declarado explicitamente (`collectCoverageFrom` ou equivalente) e mostra o que o projeto
considera lógica pura: utilitários de domínio, cliente da API externa, mapeamento de status, tema.

## Quando escrever

- Uma regra de autorização tem caso não trivial (dono, papel, estado). Teste o ator **não**
  autorizado, não só o caminho feliz.
- Uma transição de estado é adicionada: caso válido e caso rejeitado.
- Um prazo ou contagem é calculado.
- Uma regra de negócio está duplicada de propósito entre app e banco: escreva o teste que compara
  os dois mecanicamente, em vez de confiar que alguém lembra de atualizar os dois.
- Um texto legal muda: o teste compara o texto exibido, o hash declarado e o SQL da migração.
- Um bug é corrigido: o teste que falha primeiro.

## Quando não escrever

Getter, mapeamento direto linha → DTO, o que o sistema de tipos já garante.

## Níveis que existem de verdade

| Nível                              | Ferramenta                                                                               | Cobre                                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Unitário                           | Jest (preset da plataforma)                                                              | Lógica pura, paleta (contraste mínimo por par de tokens), componentes com mocks de módulos nativos, textos legais           |
| Ponta a ponta web                  | Playwright contra o ambiente de homologação real, com o sistema externo mockado por rota | Fluxos de login, cadastro, listas, uploads, notificações; suíte de RLS que cria dois usuários e prova que um não lê o outro |
| Carga                              | k6 com limiares declarados                                                               | Leitura concorrente, rotas de escrita, lote de webhooks; alvos registrados (p95 por rota, tamanho de lote)                  |
| Sondas de segurança e concorrência | Scripts Node contra funções serverless e banco de homologação                            | Método e segredo errados, payload inválido, limite de lote, replay de evento, aceite duplicado, chamadas paralelas, relógio |
| No aparelho                        | Roteiro humano, com número de build                                                      | Push, deep link, resiliência sem rede, acessibilidade                                                                       |

Regras que valem para todos os níveis:

- Mock não mocka a coisa sob teste. O sistema externo é mockado no e2e; o banco de homologação,
  não.
- Seletor de e2e estável (`testID`, texto exato com `exact: true`), nunca posição.
- Toda suíte de carga declara limiares; sem limiar é benchmark, não teste.
- Dados de teste têm prefixo reconhecível e limpeza obrigatória, inclusive em caso de falha.
- Seed e precondição são criados **imediatamente antes** da sonda, não num passo de preparação
  distante: um job de limpeza no meio derruba o teste por motivo errado.

## Um plano de testes executável por agente

Um plano escrito para ser executado pelo agente abre com instruções operacionais, não com
objetivos:

- **Ambiente:** tudo roda contra homologação; produção só leitura, e só onde o teste disser.
  Antes da primeira escrita do dia, provar o alvo (uma query que devolve um id conhecido e difere
  entre os ambientes) e registrar para qual projeto o CLI está apontando.
- **Credenciais:** obtidas por CLI e exportadas só para o processo; nunca impressas, nem em log,
  nem em comando `curl` com cabeçalho. Só status HTTP, contagens e claims decodificadas sem
  assinatura. Segredos que o agente não tem, o humano exporta na sessão.
- **Dados de teste:** prefixo por suíte e timestamp; a limpeza varre todos os prefixos.
- **Registro:** um documento versionado, uma linha por execução: ID, data, resultado
  (passou/falhou/bloqueado), evidência, observação. Bug vira item de backlog com o ID do teste.
  Linha de aparelho leva o número da build.
- **Quando parar:** falha de segurança ou de concorrência interrompe a sessão e pede decisão
  humana. Falha nas demais registra e segue.
- **Severidade:** crítico = dado de outro usuário, segredo privilegiado, registro perdido, prazo
  errado, app não abre; alto = fluxo principal bloqueado ou tomada de conta possível; médio =
  contorno existe ou vazamento que estreita ataque; baixo = hardening.

Três agentes sustentam o plano (`claude/agents/*-testes.md`): um decide estratégia e
dimensionamento, um revisa executabilidade, determinismo e isolamento, um transforma o modelo de
ameaças em sondas.
