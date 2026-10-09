import fs from "node:fs";
import { parseArgs } from "node:util";

const USO = `uso: node gerar_registro.mjs --registro <registro.json> --saida <capitulo.tex>
  [--correcoes <correcoes.json> --data-correcoes "6 de outubro de 2026" --data-correcoes-curta "06/10"]
  [--revisao "6ef6826, de 05/10/2026"] [--papeis rel] [--temas <temas.json>] [--titulo "Registro de achados"]

registro.json: lista de achados {id, titulo, tema, enunciado, evidencias[], titulares_afetados,
  dispositivos[], gravidade, verificacao, recomendacao, esforco, dependencias[]}.
correcoes.json: {por_achado: {"LGPD-01": {situacao: corrigido|parcial|pendente_externo, feito, falta}}}.`;

const { values: op } = parseArgs({
  options: {
    registro: { type: "string" },
    saida: { type: "string" },
    correcoes: { type: "string" },
    "data-correcoes": { type: "string" },
    "data-correcoes-curta": { type: "string" },
    revisao: { type: "string" },
    papeis: { type: "string", default: "rel" },
    temas: { type: "string" },
    titulo: { type: "string", default: "Registro de achados" },
    ajuda: { type: "boolean", short: "h" },
  },
});

if (op.ajuda || !op.registro || !op.saida) {
  console.log(USO);
  process.exit(op.ajuda ? 0 : 1);
}
if (op.correcoes && !op["data-correcoes"]) {
  console.error("--correcoes exige --data-correcoes");
  process.exit(1);
}

const lerJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const bruto = lerJson(op.registro);
const achados = Array.isArray(bruto) ? bruto : bruto.achados;
const correcoes = op.correcoes ? (lerJson(op.correcoes).por_achado ?? {}) : {};
const dataCorrecoes = op["data-correcoes"];
const dataCurta = op["data-correcoes-curta"] ?? dataCorrecoes;
const B = String.fromCharCode(92);

const escTexto = (t) =>
  String(t ?? "")
    .split(B)
    .join("\u0000")
    .replace(/([%&#_$])/g, (c) => B + c)
    .replace(/\{/g, B + "{")
    .replace(/\}/g, B + "}")
    .replace(/\^/g, B + "textasciicircum{}")
    .replace(/~/g, B + "textasciitilde{}")
    .replace(/</g, B + "textless{}")
    .replace(/>/g, B + "textgreater{}")
    .replace(/\u0000/g, B + "textbackslash{}")
    .replace(/→/g, "$" + B + "rightarrow$")
    .replace(/←/g, "$" + B + "leftarrow$")
    .replace(/≥/g, "$" + B + "geq$")
    .replace(/≤/g, "$" + B + "leq$")
    .replace(/≈/g, "$" + B + "approx$")
    .replace(/×/g, "$" + B + "times$")
    .replace(/[“”]/g, '"')
    .replace(/"([^"]*)"/g, B + "enquote{$1}");

const pareceCaminho = (tok) =>
  !/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(tok) &&
  !/^\d+\/\d+$/.test(tok) &&
  /^[A-Za-z0-9_.\-\/:@()=,*+?&#%~\[\]'`]+$/.test(tok) &&
  (tok.includes("/") ||
    /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|java|kt|swift|php|cs|sql|md|json|txt|html|yml|yaml|toml|xml|plist|gradle)\b/.test(
      tok,
    ) ||
    /^https?:/.test(tok)) &&
  tok.length > 3;

const NOME_DIMENSAO = {
  dados: "inventário de dados",
  operadores: "operadores",
  transparencia: "transparência",
  direitos: "direitos do titular",
  seguranca: "segurança",
  ia: "inteligência artificial",
  terceiros: "dados de terceiros",
  lojas: "lojas",
  web: "versão web",
};

function papelDeTrabalho(caminho) {
  const r = caminho.match(/refutacoes[\\/]([A-Z]+-\d+)/);
  if (r) return "papel de trabalho: refutação " + r[1];
  const c = caminho.match(/complemento-(\d+)/);
  if (c) return "papel de trabalho: apuração complementar " + c[1];
  const d = caminho.match(/dossie-([a-z-]+)\.md/);
  if (d) return "papel de trabalho: dossiê de " + (NOME_DIMENSAO[d[1]] ?? d[1]);
  return "papel de trabalho da análise";
}

const pastaPapeis = op.papeis.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rePapeis = new RegExp(
  String.raw`(?<![\w.\-/\\])(?:(?:[A-Za-z]:)?[\\/](?:[^\s,;()\\/]+[\\/])*|scratchpad[\\/])?` +
    pastaPapeis +
    String.raw`[\\/](?:[^\s,;)]|,(?=\d))+`,
  "g",
);

function escComCaminhos(t) {
  return String(t ?? "")
    .replace(rePapeis, (m) => papelDeTrabalho(m).replace(/ /g, "XXESPXX"))
    .split(/(\s+)/)
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok;
      const [, pre, bruto, pos] = tok.match(
        /^([(\["'`]*)(.*?)([)\]"'`,;:.]*)$/,
      );
      const meio = /^[A-Za-z]:\\/.test(bruto)
        ? bruto.replace(/\\/g, "/")
        : bruto;
      if (pareceCaminho(meio)) {
        const limpo = meio.replace(/[%#\\{}`]/g, "");
        return (
          escTexto(pre.replace(/`/g, "")) +
          B +
          "arq{" +
          limpo +
          "}" +
          escTexto(pos.replace(/`/g, ""))
        );
      }
      const texto = escTexto(tok.replace(/`/g, "")).replace(/XXESPXX/g, " ");
      return tok.length > 22
        ? texto
            .replace(/([.|=])/g, "$1" + B + "allowbreak{}")
            .replace(/\\_/g, B + "_" + B + "allowbreak{}")
        : texto;
    })
    .join("");
}

const ROTULO_GRAVIDADE = {
  critica: "Achados de gravidade crítica",
  alta: "Achados de gravidade alta",
  media: "Achados de gravidade média",
  baixa: "Achados de gravidade baixa",
  informativa: "Registros informativos",
};
const ROTULO_TEMA = {
  transparencia: "Transparência",
  bases_legais: "Bases legais e necessidade",
  consentimento: "Consentimento e aceite",
  direitos_do_titular: "Direitos do titular",
  retencao_e_eliminacao: "Retenção e eliminação",
  compartilhamento: "Compartilhamento",
  transferencia_internacional: "Transferência internacional",
  seguranca: "Segurança",
  incidentes: "Incidentes",
  dados_sensiveis_e_terceiros: "Dados sensíveis e de terceiros",
  inteligencia_artificial: "Inteligência artificial",
  governanca: "Governança",
  lojas_e_declaracoes: "Lojas e declarações públicas",
  aparelho_e_web: "Aparelho e navegador",
  criancas_e_adolescentes: "Crianças e adolescentes",
  ...(op.temas ? lerJson(op.temas) : {}),
};
const ROTULO_VERIFICACAO = {
  refutado_e_confirmado: "confirmado por refutador independente",
  refutado_parcial:
    "confirmado em parte por refutador independente; enunciado reescrito",
  verificador: "confirmado por verificador independente",
  nao_reverificado:
    "apurado em diligência complementar, sem segunda verificação",
};
const ROTULO_DEPENDENCIA = {
  administracao: "administração",
  juridico: "jurídico",
  engenharia: "engenharia",
  fornecedor: "fornecedor",
};
const SELO_CURTO = {
  corrigido: B + "selo{sitatende}{Corrigido}",
  parcial: B + "selo{sitparcial}{Em parte}",
  pendente_externo: B + "selo{sitexterno}{Externo}",
};
const SELO_SITUACAO = {
  corrigido: B + "selo{sitatende}{Corrigido em " + dataCurta + "}",
  parcial: B + "selo{sitparcial}{Corrigido em parte}",
  pendente_externo: B + "selo{sitexterno}{Depende de ação externa}",
};
const comoLista = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const ids = new Set();
for (const a of achados) {
  if (ids.has(a.id)) throw new Error("id repetido: " + a.id);
  ids.add(a.id);
  if (!ROTULO_GRAVIDADE[a.gravidade])
    throw new Error(a.id + ": gravidade inválida " + a.gravidade);
}
for (const id of Object.keys(correcoes)) {
  if (!ids.has(id)) throw new Error("correção para achado inexistente: " + id);
  if (!SELO_SITUACAO[correcoes[id].situacao])
    throw new Error(id + ": situação inválida " + correcoes[id].situacao);
}

const L = [];
L.push(B + "chapter{" + escTexto(op.titulo) + "}" + B + "label{cap:achados}");
L.push("");
const intro = [
  "Este capítulo reúne os " +
    achados.length +
    " achados que sobreviveram à verificação independente e, no caso dos mais graves, à tentativa de refutação.",
  "Cada ficha traz o fato apurado, a evidência que permite conferi-lo, os titulares afetados, os dispositivos possivelmente relacionados (como hipótese, sem qualificação jurídica) e a recomendação técnica" +
    (op.correcoes
      ? ", e, quando houve, a correção feita em " +
        escTexto(dataCorrecoes) +
        ", depois da análise."
      : "."),
  "As fichas estão ordenadas por gravidade e, dentro dela, por tema.",
];
if (op.revisao) {
  intro.push(
    "Os caminhos de arquivo e os números de linha referem-se à revisão analisada do código (" +
      escTexto(op.revisao) +
      ").",
  );
}
intro.push(
  "As referências a papéis de trabalho (refutações, apurações complementares e dossiês por dimensão) remetem aos registros internos da análise, conservados pela engenharia e entregues mediante pedido.",
);
L.push(intro.join(" "));
L.push("");
if (op.correcoes) {
  L.push(B + "begin{nota}[Como ler a situação]");
  L.push(
    "Achados sem selo continuam abertos. " +
      SELO_SITUACAO.corrigido +
      " indica correção aplicada e verificada por teste. " +
      SELO_SITUACAO.parcial +
      " indica que parte do problema foi resolvida e o restante está descrito na ficha. " +
      SELO_SITUACAO.pendente_externo +
      " indica que a correção cabe à administração, a um fornecedor ou à consultoria jurídica.",
  );
  L.push(B + "end{nota}");
  L.push("");
}

const colunas = op.correcoes
  ? "L{1.85cm}L{7.25cm}L{2.45cm}C{1.85cm}"
  : "L{1.85cm}L{9.1cm}L{2.45cm}";
const cab =
  B +
  "toprule\n" +
  B +
  "linhacab " +
  B +
  "cab{ID} & " +
  B +
  "cab{Achado} & " +
  B +
  "cab{Tema}" +
  (op.correcoes ? " & " + B + "cab{Situação}" : "") +
  B +
  B +
  "\n" +
  B +
  "midrule";
L.push(B + "begingroup" + B + "tabelaminima");
L.push(B + "begin{longtable}{" + colunas + "}");
L.push(
  B + "caption{Índice dos achados}" + B + "label{qd:indice-achados}" + B + B,
);
L.push(
  cab,
  B + "endfirsthead",
  cab,
  B + "endhead",
  B + "bottomrule",
  B + "endfoot",
);
for (const a of achados) {
  const c = correcoes[a.id];
  L.push(
    B +
      "achadoref{" +
      a.id +
      "}" +
      B +
      "newline " +
      B +
      "gravidade{" +
      a.gravidade +
      "} & " +
      escTexto(a.titulo) +
      " & " +
      escTexto(ROTULO_TEMA[a.tema] ?? a.tema) +
      (op.correcoes ? " & " + (c ? SELO_CURTO[c.situacao] : "") : "") +
      B +
      B,
  );
}
L.push(B + "end{longtable}", B + "endgroup", "");

for (const g of Object.keys(ROTULO_GRAVIDADE)) {
  const grupo = achados.filter((a) => a.gravidade === g);
  if (!grupo.length) continue;
  L.push(B + "section{" + ROTULO_GRAVIDADE[g] + "}", "");
  for (const a of grupo) {
    const c = correcoes[a.id];
    L.push(
      B +
        "begin{achado}{" +
        a.id +
        "}{" +
        escTexto(a.titulo) +
        "}{" +
        a.gravidade +
        "}" +
        B +
        "label{achado:" +
        a.id +
        "}",
    );
    L.push(B + "campo{Tema}", escTexto(ROTULO_TEMA[a.tema] ?? a.tema));
    L.push(B + "campo{Fato apurado}", escComCaminhos(a.enunciado));
    if (a.titulares_afetados)
      L.push(
        B + "campo{Titulares afetados}",
        escComCaminhos(a.titulares_afetados),
      );
    L.push(
      B + "campo{Evidência}",
      B + "begin{itemize}[nosep,leftmargin=1.2em]",
    );
    for (const e of comoLista(a.evidencias))
      L.push(B + "item {" + B + "small " + escComCaminhos(e) + "}");
    L.push(B + "end{itemize}");
    const dispositivos = comoLista(a.dispositivos);
    if (dispositivos.length) {
      L.push(
        B + "campo{Dispositivos possivelmente relacionados (hipótese)}",
        escTexto(dispositivos.join("; ")) + ".",
      );
    }
    L.push(B + "campo{Recomendação técnica}", escComCaminhos(a.recomendacao));
    const extra = [];
    if (a.esforco)
      extra.push(
        "esforço " + escTexto(a.esforco === "medio" ? "médio" : a.esforco),
      );
    const deps = comoLista(a.dependencias);
    if (deps.length)
      extra.push(
        "depende de " +
          escTexto(deps.map((d) => ROTULO_DEPENDENCIA[d] ?? d).join(", ")),
      );
    if (a.verificacao)
      extra.push(
        "verificação: " +
          escTexto(ROTULO_VERIFICACAO[a.verificacao] ?? a.verificacao),
      );
    if (extra.length) L.push(B + "campo{Execução}", extra.join("; ") + ".");
    if (c) {
      L.push(
        B +
          "campo{Situação após as correções de " +
          escTexto(dataCorrecoes) +
          "}",
      );
      L.push(
        SELO_SITUACAO[c.situacao] +
          " " +
          escComCaminhos(c.feito) +
          (c.falta
            ? " " + B + "textbf{Falta:} " + escComCaminhos(c.falta)
            : ""),
      );
    }
    L.push(B + "end{achado}", "");
  }
}

fs.writeFileSync(op.saida, L.join("\n"), "utf8");
const caminhosLocais =
  L.join("\n").match(/(?:[A-Za-z]:\/Users\/|\/home\/|\/Users\/)[^}\s]*/g) ?? [];
if (caminhosLocais.length) {
  console.error(
    "aviso: " +
      caminhosLocais.length +
      " caminho(s) local(is) com nome de usuário no capítulo; troque no JSON pelo nome do documento: " +
      [...new Set(caminhosLocais)].slice(0, 5).join(", "),
  );
}
const porGravidade = Object.fromEntries(
  Object.keys(ROTULO_GRAVIDADE).map((g) => [
    g,
    achados.filter((a) => a.gravidade === g).length,
  ]),
);
console.log(
  JSON.stringify({
    achados: achados.length,
    porGravidade,
    comCorrecao: Object.keys(correcoes).length,
    linhas: L.length,
  }),
);
