# Armadilhas de Expo / React Native que já custaram uma sessão

Cada item entra no `CLAUDE.md` do projeto na seção "Armadilhas", no mesmo commit em que foi
corrigido.

## Build e configuração

- **Rota nova quebra o typecheck até reiniciar o servidor de desenvolvimento.** Rotas tipadas são
  geradas no start do bundler; um arquivo novo em `app/` só existe para o `tsc` depois de um start
  novo. Não "conserte" o erro mudando o código da rota.
- **Variável pública de build é inlinada em build time.** Mudar o `.env` não muda um app já
  buildado; precisa rebuildar. Vale para origem do app e chaves de SDKs de cliente.
- **`ios/` e `android/` são gerados** e ficam no `.gitignore`. Editar arquivo nativo lá evapora no
  próximo prebuild; a mudança vai no config ou num plugin.
- **Componente nativo em beta exige dev client novo a cada versão.** Carregue por `require`
  condicional e caia num fallback em JavaScript; não importe o pacote direto em tela.
- **Arquivo de tipos gerado pode ser commitado vazio.** Um redirecionamento de shell trunca o
  arquivo antes de o gerador falhar. O script só grava se a saída tiver o tipo esperado
  (`scripts/gen-types.mjs`). Nunca recupere o arquivo com `git checkout` esperando que ele volte.
- **Dois ambientes de backend e um CLI linkado.** Confirme para qual ambiente o CLI aponta antes de
  qualquer escrita.
- **Edição por pipeline de shell no Windows corrompe acentos.** Um cmdlet de escrita regravou um
  arquivo de código-fonte com dupla codificação; o teste de texto pegou. Edições em texto com acento
  passam por ferramenta de edição, não por `Set-Content`/`sed` encadeado.

## Layout

- **Edge-to-edge no Android.** O app desenha por baixo da barra de navegação do sistema (~48 dp com
  três botões). Padding fixo na base não é área segura. Conteúdo preso à base usa um hook que soma
  `useSafeAreaInsets().bottom` só no Android; listas dentro de abas somam também a altura da barra
  de abas (80 dp no Material 3). `contentInsetAdjustmentBehavior` é só iOS. O Jest recebe o mock
  oficial de `react-native-safe-area-context` no setup.
- **A barra de abas tem dois layouts.** Nativo (iOS/Android) e JS (web), escolhidos por sufixo de
  arquivo. Rota nova nas abas entra nos dois; o bundler não avisa se um ficar para trás. Cada aba
  visível é uma pilha própria com cabeçalho nativo.
- **No Android, a barra de abas nativa precisa de cuidado visual:** fundo de superfície (não o
  padrão do Material), ícone cheio na aba selecionada, cor da janela igual à da barra para não
  sobrar uma faixa de cor diferente sob os botões do sistema, rótulo em 12 px.
- **Tokens de fundo de página não servem para tile.** No tema escuro, o token de página é a cor
  mais escura da paleta e o tile afunda em vez de subir; dentro de card ou sheet use o token de
  superfície.
- **Cabeçalho nativo no Android cola o elemento da esquerda no título.** Dê margem explícita ao
  componente de `headerLeft`.

## SDKs e monitoramento

- **SDK nativo entra por shim** (`lib/<sdk>.ts` reexporta `.web.ts`; o bundler escolhe
  `.native.ts`), inicializado por componente headless no layout raiz atrás de
  `Platform.OS !== 'web'`. Imposto por `no-restricted-imports`.
- **Crash reporting inicializa no escopo do módulo do layout raiz**, não em `useEffect`, que só
  roda depois do primeiro render e perderia crash de boot.
- **Push de mais de um SDK no Android** (notificações da plataforma, mensageria, suporte) compete
  pelo mesmo serviço de mensagens. Faça um spike em aparelho físico antes de prometer que os três
  chegam.

## Lojas

- **Versão fechada na loja.** Um build com a mesma versão de marketing de um build já aprovado é
  recusado. A versão volta da branch principal para a de desenvolvimento após cada release.
- **Dev build e app da loja têm o mesmo pacote e assinaturas diferentes.** Não convivem no mesmo
  aparelho; desinstale um para instalar o outro. "Pacote inválido" ao instalar um APK quase sempre
  é isso.
- **Build de homologação vai para o mesmo app no TestFlight que o de produção.** Diferencie pelo
  número de build e pelo nome exibido, e diga ao testador qual instalar.
- **Merge na branch principal manda o Android direto à trilha de produção** quando o perfil de
  submit diz isso. Se há uma versão em análise, espere antes de fundir a próxima.
