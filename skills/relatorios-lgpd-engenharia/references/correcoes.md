# Ciclo opcional: corrigir achados e atualizar o relatório

Muitas vezes, ao ver o registro, o usuário pede para corrigir parte dos achados antes de entregar. O
relatório então descreve o **estado atual**: o fato apurado continua relatado como fato da data da
análise, seguido do que foi corrigido, como foi verificado e o que falta. Esconder o achado corrigido
seria apagar evidência de diligência; o advogado quer ver as duas coisas.

## 1. Separar o que é de engenharia do que não é

Para cada achado escolhido, classifique:

- **Engenharia resolve sozinha:** código, migração, configuração, teste.
- **Precisa de decisão da administração:** identidade do controlador, encarregado, prazos de
  retenção, o que fazer com dados reais em homologação, contas e acessos.
- **Precisa de ação externa:** chaves de terceiros, painel de fornecedor, fichas das lojas, contrato,
  publicação, revisão jurídica de texto.

Pergunte as decisões de uma vez, com opções e uma recomendação (a ferramenta de pergunta ao usuário,
se houver). Peça as ações externas como passos concretos que o usuário executa, dizendo exatamente
onde clicar ou que comando rodar e o que devolver. Não bloqueie o resto esperando a resposta:
continue no que não depende dela.

## 2. Corrigir seguindo as regras do projeto

As correções são mudanças normais de código: seguem o arquivo de instruções do projeto, os portões,
os testes e a revisão. Em especial:

- Mudança que toca autenticação, segredo, função de servidor ou dependência passa por revisão de
  segurança antes do commit; mudança de banco, por revisão de banco. Corrija o que a revisão achar.
- Toda correção tem verificação reproduzível (teste automatizado, script de sonda, consulta) e o
  resultado registrado onde o projeto registra resultados de teste.
- Escrita em produção (migração, dados) só com confirmação explícita do usuário, ambiente conferido
  antes; primeiro em homologação. Ações destrutivas (apagar contas de homologação, arquivos órfãos)
  também pedem confirmação, com contagem antes e depois.
- Commit e merge só quando o usuário pedir, com o portão do projeto verde.

## 3. Registrar as correções

Grave `rel/correcoes-<data>.json`:

```json
{
  "data": "2026-10-06",
  "commit": "abc1234",
  "resumo": "O que mudou, em três frases.",
  "decisoes_da_administracao": {
    "controlador": "Razão social, CNPJ, endereço",
    "encarregado": "Nome e contato",
    "homologacao": "Apagar dados reais"
  },
  "por_achado": {
    "LGPD-01": {
      "situacao": "parcial",
      "feito": "O que foi feito, com caminho de arquivo e como foi verificado.",
      "falta": "O que ainda falta e de quem depende."
    },
    "LGPD-05": { "situacao": "corrigido", "feito": "...", "falta": "" },
    "LGPD-09": {
      "situacao": "pendente_externo",
      "feito": "...",
      "falta": "..."
    }
  },
  "revisao_de_seguranca": "Achados da revisão e como foram tratados."
}
```

`situacao`: `corrigido` (aplicado e verificado por teste), `parcial` (parte resolvida, resto descrito
em `falta`), `pendente_externo` (depende de administração, fornecedor ou jurídico). Achado sem entrada
continua aberto.

## 4. Atualizar o relatório

1. Gere o registro de novo com `--correcoes` (cada ficha ganha o selo e o campo "Situação após as
   correções").
2. Reescreva o capítulo 14 começando pelas correções (quadro e um parágrafo por grupo) e depois o
   plano para o restante.
3. Sumário executivo: um parágrafo com as contagens (corrigidos, em parte, externos).
4. Abertura: período da análise e das correções, revisões de código das correções.
5. **Procure afirmações velhas** em todos os capítulos, anexos e diagramas: cada achado corrigido tem
   frases espalhadas que agora estão erradas ("não há registro de IP", "as chaves não estão
   configuradas", "a exclusão não alcança o fornecedor X"). Faça um grep pelos termos de cada achado
   corrigido e pelos IDs, e leia cada ocorrência. Diagramas de ciclo (exclusão de conta, fluxo de
   dados) costumam ficar para trás.
6. Recompile, confira visualmente e reempacote.

## 5. Resposta honesta sobre conformidade

Se o usuário perguntar "agora está de acordo com a LGPD?", a resposta técnica é quase sempre "não
ainda", com o que já foi resolvido e o que falta, separado entre engenharia, administração e
jurídico. Conformidade é qualificação jurídica: o relatório e a resposta descrevem fatos e lacunas, e
a conclusão é do consultor.
