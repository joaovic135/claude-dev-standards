export const meta = {
  name: "relatorios-analise",
  description:
    "Analisa o sistema em três trilhas: LGPD com verificação adversarial, avaliações de uso e inventário de engenharia",
  phases: [
    {
      title: "Método e catálogo",
      detail: "base legal verificada, método GenderMag e catálogo de telas",
    },
    { title: "Analisar LGPD", detail: "dimensões em paralelo" },
    {
      title: "Verificar LGPD",
      detail: "um verificador independente por dossiê",
    },
    {
      title: "Refutar achados graves",
      detail: "um refutador por achado crítico ou alto",
    },
    {
      title: "Inventariar engenharia",
      detail: "testes, resultados, arquitetura, processo, IA e UX",
    },
    { title: "Avaliar personas", detail: "GenderMag e persona de domínio" },
    {
      title: "Verificar UX",
      detail: "conferência de cada problema contra tela e código",
    },
    {
      title: "Completar LGPD",
      detail: "crítico de completude e apurações complementares",
    },
    {
      title: "Consolidar",
      detail: "registro mestre, matriz, perguntas, quesitos e UX consolidada",
    },
  ],
};

const A = args || {};
if (!A.skill || !A.rel)
  throw new Error("args.skill e args.rel são obrigatórios");
const SEP = A.rel.includes("\\") ? "\\" : "/";
const p = (...partes) => partes.join(SEP);
const REL = A.rel;
const SKILL = A.skill;
const TELAS = A.telas || p(REL, "telas");
const W = { model: A.modelo || "opus", effort: A.esforco || "high" };
const REF = (arq) => p(SKILL, "references", arq);
const LEIA =
  "Leia " +
  p(REL, "contexto.md") +
  " inteiro antes de começar: ele descreve o sistema, as regras de ambiente, de segredo e de evidência, e vale acima de qualquer outra instrução.";

const TODAS = [
  {
    key: "dados",
    prefixo: "DAD",
    titulo: "Inventário de dados pessoais e armazenamento",
    web: false,
  },
  {
    key: "operadores",
    prefixo: "OPE",
    titulo: "Compartilhamento com terceiros e transferência internacional",
    web: true,
  },
  {
    key: "transparencia",
    prefixo: "TRA",
    titulo:
      "Transparência, bases legais aparentes, consentimento e registro do aceite",
    web: true,
  },
  {
    key: "direitos",
    prefixo: "DIR",
    titulo: "Direitos do titular, retenção e eliminação",
    web: false,
  },
  {
    key: "seguranca",
    prefixo: "SEG",
    titulo: "Medidas de segurança, prevenção e resposta a incidentes",
    web: false,
  },
  {
    key: "ia",
    prefixo: "IA",
    titulo: "Inteligência artificial e decisões automatizadas",
    web: true,
  },
  {
    key: "terceiros",
    prefixo: "TER",
    titulo: "Dados de terceiros, dados sensíveis e sigilo",
    web: false,
  },
  {
    key: "lojas",
    prefixo: "LOJ",
    titulo: "Lojas de aplicativos, permissões e declarações públicas",
    web: true,
  },
  {
    key: "web",
    prefixo: "WEB",
    titulo: "Versão web, armazenamento no navegador e exposição pública",
    web: true,
  },
];
const dimensao = (x) => {
  const chave = typeof x === "string" ? x : x.key;
  const base = TODAS.find((d) => d.key === chave);
  if (!base && typeof x === "string")
    throw new Error(
      "dimensão desconhecida: " +
        x +
        " (para uma nova, passe {key, prefixo, titulo, web})",
    );
  return {
    ...(base || { web: false, nova: true }),
    ...(typeof x === "string" ? {} : x),
  };
};
const DIMENSOES = A.dimensoes ? A.dimensoes.map(dimensao) : TODAS;
const ENGENHARIA = A.engenharia || [
  "testes-catalogo",
  "resultados",
  "arquitetura",
  "processo",
  "ia-produto",
  "design",
];
const COM_UX = A.ux !== false;
const PERSONAS = (A.personas || ["abi", "tim"]).map((k) => ({
  key: k,
  nome: k[0].toUpperCase() + k.slice(1),
  prefixo: k.toUpperCase(),
}));
const PERSONAS_DOMINIO = A.personasDominio || ["dominio"];
const MIN_TELAS = A.minTelas ?? 5;
const MAX_REFUTACOES = A.refutacoes ?? 3;
const MAX_LACUNAS = A.lacunas ?? 8;
const tipo = (web) => (web ? "general-purpose" : undefined);

const GRAV = ["critica", "alta", "media", "baixa", "informativa"];
const ACHADO = {
  type: "object",
  properties: {
    id: { type: "string" },
    titulo: { type: "string" },
    descricao: { type: "string" },
    evidencias: { type: "string" },
    gravidade: { type: "string", enum: GRAV },
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
          gravidade_final: { type: "string", enum: GRAV.concat("removido") },
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
    gravidade_final: { type: "string", enum: GRAV.concat("removido") },
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
const CATALOGO = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    resumo: { type: "string" },
    total_telas: { type: "number" },
    manifesto: { type: "string" },
    pendencias: { type: "string" },
  },
  required: ["ok", "resumo", "total_telas", "manifesto"],
};
const BUGS = {
  type: "object",
  properties: {
    resumo: { type: "string" },
    arquivo: { type: "string" },
    passos_avaliados: { type: "number" },
    passos_com_problema: { type: "number" },
    bugs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          cenario: { type: "string" },
          passo: { type: "string" },
          tela: { type: "string" },
          facetas: { type: "string" },
          descricao: { type: "string" },
          evidencia: { type: "string" },
          gravidade: { type: "string", enum: ["alta", "media", "baixa"] },
          recomendacao: { type: "string" },
        },
        required: [
          "id",
          "cenario",
          "passo",
          "descricao",
          "evidencia",
          "gravidade",
          "recomendacao",
        ],
      },
    },
  },
  required: [
    "resumo",
    "arquivo",
    "passos_avaliados",
    "passos_com_problema",
    "bugs",
  ],
};

const foco = (d) =>
  d.nova
    ? "Esta é uma dimensão criada para este sistema e não tem subseção na referência: o foco dela está em " +
      p(REL, "foco-" + d.key + ".md") +
      ", que você segue no lugar da seção 4."
    : "Se " +
      p(REL, "foco-" + d.key + ".md") +
      " existir, ele adapta o foco ao sistema e prevalece sobre o texto genérico.";

const promptAnalista = (d) =>
  [
    LEIA,
    "Depois leia " +
      REF("metodo-lgpd.md") +
      ": seções 2 (gravidade), 3 (estrutura do dossiê), 5 (prompt do analista) e " +
      (d.nova
        ? "a introdução da seção 4. "
        : 'a introdução da seção 4 e a subseção "### ' + d.key + '". ') +
      foco(d),
    "Sua dimensão: " +
      d.titulo +
      " (prefixo " +
      d.prefixo +
      "). As outras, tratadas em paralelo, são: " +
      DIMENSOES.filter((x) => x.key !== d.key)
        .map((x) => x.titulo)
        .join("; ") +
      ". Fique na sua e anote na seção 6 do dossiê o que pertencer a outra.",
    "Grave " +
      p(REL, "dossie-" + d.key + ".md") +
      " e devolva o resultado estruturado.",
  ].join("\n");

const promptVerificador = (d, analise) =>
  [
    LEIA,
    "Siga a seção 6 (verificador) de " +
      REF("metodo-lgpd.md") +
      ", com o critério da seção 2.",
    "Dossiê: " +
      p(REL, "dossie-" + d.key + ".md") +
      ' (dimensão "' +
      d.titulo +
      '", prefixo ' +
      d.prefixo +
      "). Achados do analista:",
    JSON.stringify((analise && analise.achados) || [], null, 1),
  ].join("\n");

const promptRefutador = (d, a, n) =>
  [
    LEIA,
    "Siga a seção 7 (refutador) de " +
      REF("metodo-lgpd.md") +
      ", com o critério da seção 2.",
    'Dimensão "' +
      d.titulo +
      '", dossiê em ' +
      p(REL, "dossie-" + d.key + ".md") +
      ". Grave em " +
      p(REL, "refutacoes", d.prefixo + "-" + n + ".md") +
      ". Achado:",
    JSON.stringify(a, null, 1),
  ].join("\n");

const PROMPT_BASE_LEGAL = [
  LEIA,
  "Siga " +
    REF("base-legal.md") +
    " inteiro (seção 8 é a sua tarefa). Grave " +
    p(REL, "base-legal.md") +
    " e os textos em " +
    p(REL, "legis") +
    ". Devolva um resumo do que foi e do que não foi verificado.",
].join("\n");

const PROMPT_METODO_UX = PERSONAS.length
  ? [
      LEIA,
      "Leia " +
        REF("metodo-ux.md") +
        ", seções 2 a 4. Monte " +
        p(REL, "gendermag-metodo.md") +
        " a partir do material oficial em https://gendermag.org/ (WebFetch e WebSearch; URL e data de acesso; separe o lido no original do secundário), cobrindo: origem e referências; as cinco facetas e os valores de Abi, Pat e Tim; o procedimento e as perguntas exatas; o que é bug de inclusividade; regras de personalização; limitações do método e desta aplicação.",
      "No mesmo arquivo, defina as três personas personalizadas para os usuários reais do sistema (seção 3) e, em " +
        p(REL, "cenarios.md") +
        ", de 5 a 8 cenários (seção 4), se esses arquivos ainda não existirem. Todos os nomes e dados são fictícios. Devolva um resumo e as fontes.",
    ].join("\n")
  : [
      LEIA,
      "Leia " +
        REF("metodo-ux.md") +
        ", seção 4, e escreva " +
        p(REL, "cenarios.md") +
        " com 5 a 8 cenários derivados do sistema real, se o arquivo ainda não existir. Sem GenderMag nesta execução. Devolva um resumo.",
    ].join("\n");

const PROMPT_CATALOGO = [
  LEIA,
  "Siga " +
    REF("metodo-ux.md") +
    ", seção 1. Se " +
    p(REL, "catalogo-instrucoes.md") +
    " existir, ele diz como rodar o sistema e os testes ponta a ponta neste projeto e prevalece.",
  "Grave as imagens em " +
    TELAS +
    " e o manifesto em " +
    p(REL, "catalogo", "telas.json") +
    ". Rode a captura a partir de uma pasta de ferramentas fora do repositório, salvo se catalogo-instrucoes.md autorizar um arquivo de teste no repositório. Antes de subir o sistema, confirme para qual banco ele aponta (só host e nome) e force a instância descartável, como o contexto manda. Devolva o resultado estruturado.",
].join("\n");

const baseTelas = (ok) =>
  ok
    ? "Base: o catálogo " +
      p(REL, "catalogo", "telas.json") +
      " e as capturas em " +
      TELAS +
      ". ABRA as imagens com Read a cada passo."
    : "O catálogo de capturas não ficou disponível: avalie por leitura do código das telas e declare essa limitação no início do relatório.";

const promptGenderMag = (pers, ok) =>
  [
    LEIA,
    "Siga " +
      REF("metodo-ux.md") +
      ", seção 5, e a nota de método " +
      p(REL, "gendermag-metodo.md") +
      " (leia inteira antes). Cenários em " +
      p(REL, "cenarios.md") +
      ".",
    "Persona: " +
      pers.nome +
      " (prefixo " +
      pers.prefixo +
      "). " +
      baseTelas(ok),
    "Grave " +
      p(REL, "gendermag-" + pers.key + ".md") +
      " e devolva o resultado estruturado.",
  ].join("\n");

const promptDominio = (chave, ok) =>
  [
    LEIA,
    "Siga " +
      REF("metodo-ux.md") +
      ", seção 6. Persona de domínio: " +
      chave +
      ". Se " +
      p(REL, "persona-" + chave + "-ficha.md") +
      " existir, use a persona de lá; senão, construa-a a partir do código e dos documentos e grave a ficha nesse arquivo. Cenários em " +
      p(REL, "cenarios.md") +
      " (use os que esse perfil de usuário executa). " +
      baseTelas(ok),
    "Grave " +
      p(REL, "persona-" + chave + ".md") +
      " e devolva o resultado estruturado (no campo facetas, a heurística ou a lente aplicada).",
  ].join("\n");

const promptVerificaUx = (rotulo, arquivo, bugs) =>
  [
    LEIA,
    "Siga " +
      REF("metodo-ux.md") +
      ', seção 7 (verificador). Avaliação "' +
      rotulo +
      '", em ' +
      arquivo +
      ". Capturas em " +
      TELAS +
      ". Problemas:",
    JSON.stringify(bugs || [], null, 1),
  ].join("\n");

const promptEngenharia = (key) =>
  [
    LEIA,
    'Trilha de engenharia. Leia a introdução e a frente "' +
      key +
      '" de ' +
      REF("engenharia.md") +
      " e execute-a. Números copiados das fontes, sem arredondar nem estimar. Grave no diretório " +
      REL +
      ".",
    "Devolva um resumo de até 200 palavras com os principais números e o caminho do arquivo gravado.",
  ].join("\n");

const pBase = agent(PROMPT_BASE_LEGAL, {
  ...W,
  label: "base-legal",
  phase: "Método e catálogo",
  agentType: "general-purpose",
});
const pMetodo = COM_UX
  ? agent(PROMPT_METODO_UX, {
      ...W,
      label: "metodo-gendermag",
      phase: "Método e catálogo",
      agentType: "general-purpose",
    })
  : Promise.resolve(null);
const pCatalogo = COM_UX
  ? agent(PROMPT_CATALOGO, {
      ...W,
      label: "catalogo-telas",
      phase: "Método e catálogo",
      schema: CATALOGO,
    })
  : Promise.resolve(null);

const pLgpd = pipeline(
  DIMENSOES,
  (d) =>
    agent(promptAnalista(d), {
      ...W,
      label: "analisar:" + d.key,
      phase: "Analisar LGPD",
      schema: ACHADOS,
      agentType: tipo(d.web),
    }),
  (analise, d) =>
    agent(promptVerificador(d, analise), {
      ...W,
      label: "verificar:" + d.key,
      phase: "Verificar LGPD",
      schema: VERIFICACAO,
      agentType: tipo(d.web),
    }).then((verificacao) => ({ analise, verificacao })),
  (r, d) => {
    const vereditos = (r.verificacao && r.verificacao.vereditos) || [];
    const finalDe = (id) => {
      const v = vereditos.find((x) => x.id === id);
      return v ? v.gravidade_final : null;
    };
    const originais = ((r.analise && r.analise.achados) || []).map((a) => ({
      ...a,
      gravidade: finalDe(a.id) || a.gravidade,
    }));
    const novos = (r.verificacao && r.verificacao.novos_achados) || [];
    const todos = originais.concat(novos);
    const graves = todos
      .filter((a) => a.gravidade === "critica")
      .concat(todos.filter((a) => a.gravidade === "alta"))
      .slice(0, MAX_REFUTACOES);
    const sobra =
      todos.filter((a) => a.gravidade === "critica" || a.gravidade === "alta")
        .length - graves.length;
    if (sobra > 0)
      log(
        "dimensão " +
          d.key +
          ": " +
          sobra +
          " achado(s) grave(s) sem refutação individual (limite de " +
          MAX_REFUTACOES +
          ")",
      );
    if (!graves.length) return { dim: d.key, ...r, refutacoes: [] };
    return parallel(
      graves.map(
        (a, i) => () =>
          agent(promptRefutador(d, a, i + 1), {
            ...W,
            label: "refutar:" + d.prefixo + "-" + (i + 1),
            phase: "Refutar achados graves",
            schema: REFUTACAO,
            agentType: tipo(d.web),
          }).then((v) => ({ achado: a, refutacao: v })),
      ),
    ).then((refutacoes) => ({
      dim: d.key,
      ...r,
      refutacoes: refutacoes.filter(Boolean),
    }));
  },
);

const pEng = parallel(
  ENGENHARIA.map(
    (key) => () =>
      agent(promptEngenharia(key), {
        ...W,
        label: "engenharia:" + key,
        phase: "Inventariar engenharia",
      }).then((resumo) => ({ key, resumo })),
  ),
);

const pUx = !COM_UX
  ? Promise.resolve({ catalogo: null, avaliacoes: [] })
  : Promise.all([pMetodo, pCatalogo]).then(([metodo, catalogo]) => {
      const ok = Boolean(
        catalogo && catalogo.ok && catalogo.total_telas >= MIN_TELAS,
      );
      log(
        "catálogo: " +
          (catalogo
            ? catalogo.total_telas + " telas, ok=" + catalogo.ok
            : "falhou") +
          "; método GenderMag: " +
          (metodo ? "pronto" : "falhou"),
      );
      const avaliar = (rotulo, chave, arquivo, prompt) => () =>
        agent(prompt, {
          ...W,
          label: rotulo,
          phase: "Avaliar personas",
          schema: BUGS,
        }).then((r) =>
          r
            ? agent(promptVerificaUx(rotulo, arquivo, r.bugs), {
                ...W,
                label: "verificar-ux:" + chave,
                phase: "Verificar UX",
                schema: BUGS,
              }).then((v) => ({ persona: chave, avaliacao: r, verificado: v }))
            : null,
        );
      const tarefas = PERSONAS.map((pers) =>
        avaliar(
          "gendermag:" + pers.key,
          pers.key,
          p(REL, "gendermag-" + pers.key + ".md"),
          promptGenderMag(pers, ok),
        ),
      );
      for (const chave of PERSONAS_DOMINIO) {
        tarefas.push(
          avaliar(
            "persona:" + chave,
            chave,
            p(REL, "persona-" + chave + ".md"),
            promptDominio(chave, ok),
          ),
        );
      }
      return parallel(tarefas).then((rs) => ({
        catalogo,
        avaliacoes: rs.filter(Boolean),
      }));
    });

const [lgpd, eng, ux, base] = await Promise.all([pLgpd, pEng, pUx, pBase]);
const lgpdOk = lgpd.filter(Boolean);
log(
  "LGPD: " +
    lgpdOk.length +
    " de " +
    DIMENSOES.length +
    " dimensões; engenharia: " +
    eng.filter(Boolean).length +
    " de " +
    ENGENHARIA.length +
    "; avaliações de UX: " +
    ux.avaliacoes.length,
);

const cadeiaLgpd = async () => {
  const critica = await agent(
    [
      LEIA,
      "Siga a seção 8 (crítico de completude) de " +
        REF("metodo-lgpd.md") +
        ". No máximo " +
        MAX_LACUNAS +
        " lacunas. Grave " +
        p(REL, "lacunas.json") +
        ".",
    ].join("\n"),
    { ...W, label: "critico-lgpd", phase: "Completar LGPD", schema: LACUNAS },
  );
  const lacunas = ((critica && critica.lacunas) || []).slice(0, MAX_LACUNAS);
  const complementos = await parallel(
    lacunas.map(
      (l, i) => () =>
        agent(
          [
            LEIA,
            "Siga a seção 8 (apuração complementar) de " +
              REF("metodo-lgpd.md") +
              ", com o critério da seção 2. Número " +
              (i + 1) +
              ". Tema: " +
              l.tema +
              ". Por que importa: " +
              l.por_que_importa +
              ". Como apurar: " +
              l.como_apurar +
              ".",
            "Grave " +
              p(REL, "complementos", "complemento-" + (i + 1) + ".md") +
              ".",
          ].join("\n"),
          {
            ...W,
            label: "complemento:" + (i + 1),
            phase: "Completar LGPD",
            schema: ACHADOS,
            agentType: "general-purpose",
          },
        ),
    ),
  );
  const registro = await agent(
    [
      LEIA,
      "Siga a seção 9 (consolidação) de " +
        REF("metodo-lgpd.md") +
        ". Fontes em " +
        REL +
        ": dossie-*.md, refutacoes/, complementos/, base-legal.md e, se existir, catalogo/telas.json (para o campo capturas). Se temas.json existir, os temas de lá completam a lista de temas da seção 9.",
    ].join("\n"),
    { ...W, label: "registro-lgpd", phase: "Consolidar" },
  );
  return { critica, complementos: complementos.filter(Boolean), registro };
};

const cadeiaUx = async () => {
  if (!ux.avaliacoes.length) return "sem avaliações para consolidar";
  return agent(
    [
      LEIA,
      "Siga a seção 7 (consolidação) de " +
        REF("metodo-ux.md") +
        ". Fontes em " +
        REL +
        ": gendermag-metodo.md, cenarios.md, gendermag-*.md, " +
        PERSONAS_DOMINIO.map((k) => "persona-" + k + ".md").join(", ") +
        " (com a verificação independente) e catalogo/telas.json. Grave " +
        p(REL, "ux-consolidado.md") +
        (A.docsUx
          ? " e os documentos de avaliação em docs/ do repositório"
          : "") +
        ". Não invente problema novo. Devolva os números.",
    ].join("\n"),
    { ...W, label: "consolidar-ux", phase: "Consolidar" },
  );
};

const [fimLgpd, fimUx] = await Promise.all([cadeiaLgpd(), cadeiaUx()]);

return {
  base_legal: base,
  lgpd: lgpdOk.map((r) => ({
    dim: r.dim,
    resumo: r.analise && r.analise.resumo,
    achados: ((r.analise && r.analise.achados) || []).length,
    verificacao: r.verificacao && r.verificacao.resumo,
    refutacoes: (r.refutacoes || []).map((x) => ({
      id: x.achado.id,
      veredito: x.refutacao && x.refutacao.veredito,
      gravidade: x.refutacao && x.refutacao.gravidade_final,
    })),
  })),
  lgpd_final: {
    lacunas: fimLgpd.critica && fimLgpd.critica.lacunas,
    complementos: fimLgpd.complementos.length,
    registro: fimLgpd.registro,
  },
  engenharia: eng.filter(Boolean),
  ux: {
    catalogo: ux.catalogo,
    avaliacoes: ux.avaliacoes.map((a) => ({
      persona: a.persona,
      passos: a.avaliacao.passos_avaliados,
      com_problema: a.avaliacao.passos_com_problema,
      bugs_verificados: a.verificado ? a.verificado.bugs.length : null,
    })),
    consolidado: fimUx,
  },
};
