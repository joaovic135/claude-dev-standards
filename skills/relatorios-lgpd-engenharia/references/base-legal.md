# Base legal verificada

A base legal é a folha de referências que todos os outros agentes e redatores usam para citar
lei. Ela existe porque um único inciso trocado ou um prazo errado basta para um advogado
desconfiar do documento inteiro. O agente que a monta **não dá parecer**: garante que cada
dispositivo citado existe, está em vigor e diz o que o relatório diz que diz.

Saída: `rel/base-legal.md` e os textos limpos em `rel/legis/`.

## Sumário

1. Regra de ouro
2. Como baixar e limpar o texto oficial
3. O que transcrever da LGPD
4. ANPD e normas correlatas (retrato verificado em 05/10/2026)
5. Normas setoriais
6. Armadilhas de citação
7. Estrutura do arquivo `base-legal.md`
8. Prompt do agente

## 1. Regra de ouro

Aspas só sobre texto copiado de arquivo baixado da fonte oficial. O que não foi baixado fica marcado
"não verificado no texto oficial" e não pode ser transcrito no relatório. Cada transcrição leva
`arquivo.txt:linha`, para conferência.

## 2. Como baixar e limpar o texto oficial

As páginas do Planalto costumam vir em ISO-8859-1/cp1252 e marcam o texto revogado com tachado.
O script `scripts/limpar_lei.py` decodifica, tira o HTML e **descarta os trechos tachados** (ou os
mantém marcados com `--com-tachados`, útil para saber a redação anterior).

```bash
mkdir -p rel/legis
curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm" -o rel/legis/lgpd.raw.html
python <skill>/scripts/limpar_lei.py rel/legis/lgpd.raw.html rel/legis/lgpd.txt
python <skill>/scripts/limpar_lei.py rel/legis/lgpd.raw.html rel/legis/lgpd.com-tachados.txt --com-tachados
grep -c $'�' rel/legis/lgpd.txt   # tem de dar 0: nenhum caractere perdido na decodificação
```

Se o compilado falhar, tente `.../lei/L13709.htm` ou o WebFetch. Faça o mesmo, quando fizer sentido
para o projeto, com:

| Norma                                     | URL (Planalto)                                   | Para quê                                   |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------ |
| Constituição Federal                      | `ccivil_03/constituicao/constituicao.htm`        | art. 5º, X, XII e LXXIX                    |
| Marco Civil da Internet (Lei 12.965/2014) | `ccivil_03/_ato2011-2014/2014/lei/l12965.htm`    | arts. 7º, 15 e 16 (registros de acesso)    |
| Decreto 8.771/2016                        | `ccivil_03/_ato2015-2018/2016/decreto/d8771.htm` | art. 13 (segurança)                        |
| CDC (Lei 8.078/1990)                      | `ccivil_03/leis/l8078compilado.htm`              | quando há consumidor                       |
| MP 2.200-2/2001 e Lei 14.063/2020         | `ccivil_03/mpv/antigas_2001/2200-2.htm`          | aceite eletrônico e assinatura             |
| LC 123/2006                               | `ccivil_03/leis/lcp/lcp123.htm`                  | porte da empresa (agente de pequeno porte) |
| Lei 15.211/2025 (ECA Digital)             | busque no Planalto                               | produto de acesso provável por crianças    |

Atos da ANPD: página "Regulamentações da ANPD"
(`https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd`)
e a busca do DOU (`https://www.in.gov.br/consulta/-/buscar/dou`, consulta `"RESOLUÇÃO CD/ANPD"`, do
último ano até hoje) para achar o que a página ainda não lista.

## 3. O que transcrever da LGPD

Trecho essencial, literal, curto, de cada dispositivo que um relatório de conformidade costuma
citar: arts. 1º, 3º, 5º (incisos I, II, V, VI, VII, VIII, X, XII, XVI, XVII), 6º (todos os incisos),
7º (todos os incisos e os parágrafos vigentes), 8º, 9º, 10, 11, 12, 13 § 4º, 14, 15, 16, 17, 18
(todos os incisos e parágrafos), 19, 20, 33 a 36, 37, 38, 39, 41, 42 a 45, 46 a 49, 50 e 52. Registre
a redação dada por lei posterior quando houver (por exemplo, Lei 13.853/2019 e Lei 15.352/2026).

## 4. ANPD e normas correlatas (retrato verificado em 05/10/2026)

Este quadro resume o que foi verificado no texto oficial na execução que deu origem a esta skill.
**Use como ponto de partida, não como fonte**: confira cada item de novo na data da sua análise e
procure atos posteriores. Se algum item mudou, registre a mudança na sua `base-legal.md`.

| Ato                                          | Pontos-chave                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lei 15.352/2026 (conversão da MP 1.317/2025) | A ANPD passou a se chamar **Agência** Nacional de Proteção de Dados, autarquia de natureza especial (LGPD, art. 55-A, nova redação). Para atos anteriores a 25/02/2026, use o nome da época ("Autoridade Nacional").                                                                                |
| Res. CD/ANPD 1/2021                          | Fiscalização e processo sancionador.                                                                                                                                                                                                                                                                |
| Res. CD/ANPD 2/2022 (alterada pela 15/2024)  | Agente de tratamento de pequeno porte (ME/EPP da LC 123): dispensa de encarregado com canal de comunicação; prazos em dobro; registro simplificado. Perde o regime quem faz **tratamento de alto risco** (um critério geral **e** um específico, cumulativos; dado sensível é critério específico). |
| Res. CD/ANPD 4/2023                          | Dosimetria: infração leve, média, grave; teto de 2% do faturamento no Brasil, limitado a R$ 50 milhões **por infração**.                                                                                                                                                                            |
| Enunciado CD/ANPD 1/2023                     | Dados de crianças e adolescentes podem usar as hipóteses dos arts. 7º ou 11, prevalecendo o melhor interesse.                                                                                                                                                                                       |
| Res. CD/ANPD 15/2024                         | Incidente: comunicação à ANPD e ao titular em **3 dias úteis** do conhecimento de que dados pessoais foram afetados (em dobro para pequeno porte); complementação em 20 dias úteis; registro de todo incidente por no mínimo 5 anos.                                                                |
| Res. CD/ANPD 18/2024                         | Encarregado: indicação por ato formal, substituto, divulgação "em local de destaque e de fácil acesso, no sítio eletrônico", comunicação em português.                                                                                                                                              |
| Res. CD/ANPD 19/2024                         | Transferência internacional: hipótese legal + mecanismo (adequação, cláusulas-padrão etc.); prazo para incorporar as cláusulas-padrão terminou em 23/08/2025.                                                                                                                                       |
| Res. CD/ANPD 30/2025 e 31/2025               | Mapa de Temas Prioritários 2026–2027 (fiscalização de dados biométricos, de saúde e financeiros; crianças; IA) e Agenda Regulatória 2025–2026. São **planejamento**, não obrigação.                                                                                                                 |
| Res. CD/ANPD 32/2026                         | Adequação da União Europeia e do EEE. Não havia decisão de adequação para os EUA.                                                                                                                                                                                                                   |
| IA                                           | Até 05/10/2026 a ANPD não tinha regulamento de IA (só agenda, mapa e notas técnicas).                                                                                                                                                                                                               |
| Marco Civil, art. 15                         | Provedor de aplicações pessoa jurídica com fins econômicos guarda registros de acesso por 6 meses. O Decreto 12.975/2026 incluiu a porta lógica de origem (Decreto 8.771, art. 15-A).                                                                                                               |

## 5. Normas setoriais

Depende do domínio do sistema. Pesquise só o que é diretamente pertinente e registre apenas o que
confirmar em fonte oficial, com a situação ("em vigor", "alterada", "revogada") conferida na busca
oficial do órgão. Exemplos de onde olhar:

- Saúde: o conselho profissional da categoria que usa o sistema (CFM para médicos; COFFITO para
  fisioterapeutas e terapeutas ocupacionais; CFP para psicólogos; CFO para dentistas; COFEN para
  enfermagem; CFN para nutricionistas), com o código de ética (capítulo de sigilo) e as resoluções
  sobre prontuário, telessaúde e guarda; Lei 13.787/2018 (prontuário digital); ANS e o padrão TISS
  quando há convênio ou plano de saúde.
- Judiciário: CPC (segredo de justiça, art. 189; peritos, arts. 156 a 158 e 464 a 480), atos do CNJ.
- Advocacia: Estatuto da Advocacia (sigilo, atividade privativa).
- Finanças: BACEN e CVM; sigilo bancário (LC 105/2001).
- Educação, crianças: ECA e ECA Digital.
- Trabalho: CLT e normas de saúde ocupacional.

Resolução de conselho e de agência costuma sair só em PDF. Baixe o PDF oficial e extraia o texto com
`python <skill>/scripts/extrair_pdf.py norma.pdf rel/legis/norma.txt`: a regra de ouro vale para o
`.txt` extraído (cite `norma.txt:linha`). Página escaneada sem texto não pode ser transcrita entre
aspas sem OCR conferido; registre como "não verificado no texto oficial".

## 6. Armadilhas de citação

Erros comuns que derrubam a credibilidade de um relatório. Confira cada um no texto baixado.

1. **Teto da multa (art. 52, II):** até 2% do faturamento **no Brasil** no último exercício, excluídos
   os tributos, limitada a R$ 50.000.000,00 **por infração**. Não é faturamento global nem limite por
   empresa ou por ano. Sanções vigoram desde 1º/08/2021 (art. 65, I-A).
2. **Suspensão e proibição (art. 52, X a XII)** só depois de ao menos uma sanção dos incisos II a VI
   no mesmo caso (§ 6º). Os incisos VII a IX foram vetados.
3. **Art. 7º, §§ 1º e 2º foram revogados.** Dado manifestamente público: § 4º; acesso público: § 3º.
4. **Dado sensível (art. 11)** não tem "execução de contrato" nem "legítimo interesse". A alínea "d"
   do inciso II inclui "inclusive em contrato". Tutela da saúde exige procedimento realizado
   "exclusivamente" por profissionais ou serviços de saúde ou autoridade sanitária.
5. **Prazos do titular:** os 15 dias do art. 19, II, valem para a declaração completa. Os demais
   direitos do art. 18 seguem prazo "previsto em regulamento" (§ 5º); confira se o regulamento existe.
6. **Incidente:** a LGPD diz "prazo razoável" (art. 48, § 1º); o prazo regulamentar é de 3 dias úteis
   (Res. 15/2024). **Não cite "72 horas"** — é do GDPR, não da LGPD.
7. **Encarregado:** art. 41, § 1º, diz "preferencialmente no sítio eletrônico"; a Res. 18/2024 exige
   destaque no sítio. Pequeno porte é dispensado, mas mantém canal.
8. **Art. 20, § 3º foi vetado.** A LGPD não garante "revisão humana" como texto legal.
9. **Pseudonimização** está no art. 13, § 4º, não no art. 5º.
10. **Transcreva remissões como estão** (por exemplo, o art. 52, § 1º, VIII remete ao "inciso II do
    § 2º do art. 48"). Dizer que a remissão "deveria" ser outra é interpretação.
11. **Agenda regulatória não é regulamento.** Não apresente tema da agenda como norma existente.
12. **Norma revogada:** confira a situação na busca oficial do órgão antes de citar.
13. **Nome do órgão:** use o nome vigente na data do ato citado.
14. **GDPR ≠ LGPD:** expressões como "data controller", "legitimate interest assessment", "72 hours"
    e "DPO obrigatório" não podem ser transpostas sem a base na LGPD.

## 7. Estrutura do arquivo `base-legal.md`

```
# Folha de referências jurídicas verificadas
Data de referência; finalidade; "esta folha não contém parecer".
## 0. Método, fontes e convenções   (onde estão os arquivos, como foram limpos, marcações)
## (a) LGPD                         (tabela: dispositivo | transcrição literal curta | arquivo:linha | observação de redação)
## (b) ANPD                         (tabela: ato | data/DOU | ementa | pontos-chave | fonte | texto lido: O/P/E)
## (c) Demais leis
## (d) Normas setoriais
## (e) Armadilhas de citação        (as da seção 6, conferidas, mais as que surgirem)
## (f) O que não foi verificado
```

## 8. Prompt do agente

Monte o prompt a partir de `rel/contexto.md` (ver `metodo-lgpd.md`, seção 1) mais:

> Sua tarefa: montar a folha de referências jurídicas verificadas que os relatórios vão citar. Você
> não dá parecer; garante que cada dispositivo citado existe, está em vigor e diz o que dizemos que
> diz. (1) Baixe e limpe a LGPD e as leis pertinentes com `scripts/limpar_lei.py`, gravando em
> `rel/legis/`. (2) Verifique no site oficial da ANPD e no DOU os regulamentos em vigor hoje que
> interessam ao sistema, partindo do retrato da seção 4 desta referência e procurando atos
> posteriores. Para cada um: número, data, ementa, pontos-chave em 2 a 4 linhas, URL, data de
> acesso, e se leu o texto oficial ou só a ementa. (3) Normas setoriais do domínio: só o que confirmar
> em fonte oficial. (4) Escreva `rel/base-legal.md` com a estrutura da seção 7. Regra de ouro:
> transcrição literal só do que está em arquivo baixado.
