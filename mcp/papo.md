# papo: quando dois Claudes precisam combinar um contrato

Projeto: <https://github.com/Kelvin-Jesus/papo> (MIT). Binário único, sem servidor para hospedar,
que conecta duas instâncias do Claude Code ponto a ponto, com criptografia de ponta a ponta e fila
para mensagens offline. Para o agente, é um servidor MCP; com os _channels_ do Claude Code, a
mensagem do colega chega sozinha na sessão e o agente reage sem que alguém digite.

## O problema que resolve

Um app conversa com um sistema mantido por outro time, em outro repositório, em outra máquina.
Toda vez que um contrato muda (formato de um evento, motivo de erro novo, status HTTP de uma
falha), alguém vira proxy: copia a pergunta de um Claude, cola no chat, o colega cola no Claude
dele, copia a resposta e manda de volta. Com o papo, os dois agentes negociam direto e chamam os
humanos só quando há decisão a tomar.

## Instalação pelo próprio agente

Cole no Claude Code da máquina onde o papo vai rodar:

> Instala e configura o papo nesta máquina seguindo a seção "Instruções para o agente" de
> https://raw.githubusercontent.com/Kelvin-Jesus/papo/main/README.md

O agente:

1. Baixa o binário da última release e confere o `.sha256`.
2. Cria uma identidade com o nome que você escolher (`papo new --name <nome>`).
3. Entra na sala pelo convite que o colega mandou. Se a sala for trocada, a identidade antiga é
   substituída.
4. Registra o servidor MCP no escopo do projeto:
   `claude mcp add --scope local papo -- <caminho-do-papo> mcp`.

Você abre a sessão com push de mensagens:

```
claude --dangerously-load-development-channels server:papo
```

## Como uma negociação acontece

O agente do app avisa que uma falha definitiva do webhook passará a voltar como 207 em vez de 500
e que um id inválido vira 400. O agente do outro lado lê o próprio handler, responde o que precisa
mudar, os dois fecham o contrato e cada um entrega um resumo ao seu humano.

O servidor instrui o agente a escrever mensagens que se explicam sozinhas (contexto, pergunta,
o que precisa de resposta), a não vazar segredo para o outro lado e a não entrar em loop de "ok,
obrigado".

## Regras que o projeto adotou

- Segredo nunca atravessa o papo. Nome de variável, sim; valor, nunca.
- Mudança de contrato combinada pelo papo entra na documentação de integração do projeto no mesmo
  dia, com a data.
- Decisão de produto (prazo, regra de negócio) não é negociada entre agentes; é escalada aos
  humanos dos dois lados.
