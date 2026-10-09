export const meta = {
  name: "relatorios-redacao",
  description:
    "Redige os dois volumes em LaTeX a partir dos papéis de trabalho verificados, com diagramas pré-renderizados e passes de edição",
  phases: [
    {
      title: "Diagramas",
      detail: "figuras pré-renderizadas em PDF com conferência visual",
    },
    { title: "Redigir Volume I", detail: "redatores com capítulos disjuntos" },
    { title: "Redigir Volume II", detail: "redatores com capítulos disjuntos" },
    {
      title: "Editar",
      detail: "sumário executivo, guia prático e passe de coerência por volume",
    },
  ],
};

const A = args || {};
for (const k of ["skill", "rel", "relatorios", "pdflatex", "contexto"]) {
  if (!A[k]) throw new Error("args." + k + " é obrigatório");
}
const SEP = A.relatorios.includes("\\") ? "\\" : "/";
const p = (...partes) => partes.join(SEP);
const W = { model: A.modelo || "opus", effort: A.esforco || "high" };
const REF = (arq) => p(A.skill, "references", arq);
const RENDER = "python " + p(A.skill, "scripts", "render_paginas.py");
const OVERFULL = "python " + p(A.skill, "scripts", "overfull.py");

const BASE = [
  "Leia " +
    p(A.rel, "contexto.md") +
    " (o sistema e as regras) e depois a seção 2 de " +
    REF("redacao.md") +
    ": ela é o seu prompt base, com as fontes de fato e as regras de redação. Leia também as seções 4 a 7 de " +
    REF("latex.md") +
    " e o exemplo " +
    p(A.relatorios, "estilo", "exemplo-componentes.tex") +
    ".",
  "Identificação do controlador e demais dados de capa: " + A.contexto,
  "Papéis de trabalho em " +
    A.rel +
    ". Capturas já copiadas para figuras/telas/ de cada volume (originais e manifesto em " +
    p(A.rel, "catalogo") +
    '); referencie como figuras/telas/<arquivo>. Compilador: "' +
    A.pdflatex +
    '" -interaction=nonstopmode -halt-on-error main.tex, na pasta do volume.',
  A.correcoes
    ? "Houve correções depois da análise: " +
      A.correcoes +
      ". O relatório descreve o estado atual (fato da análise seguido da correção)."
    : "Não houve correções depois da análise.",
].join("\n");

const VOL1 =
  "Volume I em " +
  p(A.relatorios, "lgpd") +
  ". Leitor: advogado sênior, não engenheiro. Registro técnico-formal, sem parecer jurídico. Roteiro de cada capítulo: quadro da seção 3 de " +
  REF("redacao.md") +
  ".";
const VOL2 =
  "Volume II em " +
  p(A.relatorios, "engenharia") +
  ". Leitor: engenheiro de software; será folheado por um advogado. Funciona como guia: cada capítulo explica o quê, o porquê, como foi aplicado, a evidência e a lição. Roteiro de cada capítulo: quadro da seção 4 de " +
  REF("redacao.md") +
  ".";

const REDATORES_I = A.redatoresI || [
  ["02-objeto-e-metodo", "03-o-sistema", "04-inventario-de-dados"],
  [
    "05-transparencia-e-bases",
    "06-compartilhamento",
    "07-direitos-e-ciclo-de-vida",
  ],
  [
    "08-dados-sensiveis-e-terceiros",
    "09-inteligencia-artificial",
    "10-seguranca",
    "11-canais-publicos",
  ],
  [
    "13-quesitos",
    "14-plano-de-adequacao",
    "anexo-matriz",
    "anexo-administracao",
    "anexo-evidencias",
    "anexo-glossario",
    "anexo-normas",
  ],
];
const REDATORES_II = A.redatoresII || [
  [
    "01-visao-geral",
    "02-arquitetura",
    "03-regras-de-codificacao",
    "anexo-regras",
  ],
  ["04-processo", "05-ia-no-desenvolvimento"],
  [
    "06-estrategia-de-testes",
    "07-catalogo-de-testes",
    "08-plano-e-resultados",
    "09-achados",
    "anexo-scripts",
  ],
  ["10-ux-e-design", "11-gendermag", "12-persona-de-dominio"],
  ["13-ia-no-produto"],
];
const DIAGRAMAS = A.diagramas || [
  "fluxo",
  "ciclos",
  "metodos",
  "achados",
  "entrega",
  "ux",
];

const promptRedator = (vol, arquivos) =>
  [
    BASE,
    "",
    vol,
    "",
    "Seus arquivos (só estes, em capitulos/): " +
      arquivos.map((a) => a + ".tex").join(", ") +
      ". Cada um já existe como provisório com o \\label certo: substitua o conteúdo mantendo o mesmo \\label. Os capítulos que não se aplicam ao sistema já foram retirados antes de você começar; se, mesmo assim, achar que um dos seus não tem fato para sustentá-lo, escreva a versão curta que os fatos permitem e explique na resposta. Não apague arquivo nem mexa no main.tex.",
  ].join("\n");

const promptDiagrama = (grupo) =>
  [
    "Leia " +
      p(A.rel, "contexto.md") +
      ". Depois siga a seção 5 de " +
      REF("redacao.md") +
      ' (prompt de diagrama) para o grupo "' +
      grupo +
      '" do quadro dessa seção.',
    "Pasta: " +
      p(A.relatorios, "diagramas") +
      '. Compilador: "' +
      A.pdflatex +
      '". Conferência: ' +
      RENDER +
      " <nome>.pdf png-<nome> --dpi 110" +
      (A.pylib ? " --pylib " + A.pylib : "") +
      ". Papéis de trabalho em " +
      A.rel +
      ".",
    "Copie os PDFs finais para " +
      p(A.relatorios, "lgpd", "figuras", "diagramas") +
      " e " +
      p(A.relatorios, "engenharia", "figuras", "diagramas") +
      ".",
  ].join("\n");

const conferencia = (vol) =>
  "Compile duas vezes em " +
  vol +
  ", corrija erros e referências indefinidas, rode " +
  OVERFULL +
  " main.log --minimo 20 e trate o que aparecer, renderize com " +
  RENDER +
  " main.pdf png --dpi 60 --paginas 1-400" +
  (A.pylib ? " --pylib " + A.pylib : "") +
  " e confira com Read umas 12 páginas variadas. Devolva alterações por capítulo, número de páginas e pendências.";

const promptEditorI = [
  BASE,
  "",
  VOL1,
  "",
  "Você é o editor do Volume I. Siga a seção 6 de " +
    REF("redacao.md") +
    ' (editor do Volume I): coerência, 01-sumario-executivo.tex, ajuste de 00-abertura.tex (sem o Volume II, retire a linha Documento relacionado), e confira que nenhum capítulo incluído no main.tex termina em "Em elaboração.".',
  conferencia(p(A.relatorios, "lgpd")),
].join("\n");

const promptEditorII = [
  BASE,
  "",
  VOL2,
  "",
  "Você é o editor do Volume II. Siga a seção 6 de " +
    REF("redacao.md") +
    ' (editor do Volume II): coerência, ajuste de 00-abertura.tex (o parágrafo Como ler tem de citar só as partes que existem no main.tex; sem o Volume I, retire a linha Documento relacionado), 14-como-fazer-um-bom-produto.tex e anexo-glossario.tex, e confira que nenhum capítulo incluído no main.tex termina em "Em elaboração." nem sobrou \\part sem capítulo.',
  conferencia(p(A.relatorios, "engenharia")),
].join("\n");

phase("Diagramas");
const pDiagramas = parallel(
  DIAGRAMAS.map(
    (g) => () =>
      agent(promptDiagrama(g), {
        ...W,
        label: "diagrama:" + g,
        phase: "Diagramas",
      }),
  ),
);
const pVolI =
  A.volumes === "engenharia"
    ? Promise.resolve([])
    : parallel(
        REDATORES_I.map(
          (arqs, i) => () =>
            agent(promptRedator(VOL1, arqs), {
              ...W,
              label: "redigir:I-" + (i + 1),
              phase: "Redigir Volume I",
            }),
        ),
      );
const pVolII =
  A.volumes === "lgpd"
    ? Promise.resolve([])
    : parallel(
        REDATORES_II.map(
          (arqs, i) => () =>
            agent(promptRedator(VOL2, arqs), {
              ...W,
              label: "redigir:II-" + (i + 1),
              phase: "Redigir Volume II",
            }),
        ),
      );

const [diagramas, volI, volII] = await Promise.all([pDiagramas, pVolI, pVolII]);
log(
  "diagramas: " +
    diagramas.filter(Boolean).length +
    " de " +
    DIAGRAMAS.length +
    "; redatores I: " +
    volI.filter(Boolean).length +
    "; redatores II: " +
    volII.filter(Boolean).length,
);

phase("Editar");
const editores = [];
if (A.volumes !== "engenharia")
  editores.push(() =>
    agent(promptEditorI, { ...W, label: "editor:volume-I", phase: "Editar" }),
  );
if (A.volumes !== "lgpd")
  editores.push(() =>
    agent(promptEditorII, { ...W, label: "editor:volume-II", phase: "Editar" }),
  );
const edicao = await parallel(editores);

return { diagramas, volI, volII, edicao };
