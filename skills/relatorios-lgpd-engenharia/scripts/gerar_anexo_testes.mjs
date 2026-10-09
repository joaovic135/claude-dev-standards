import fs from "node:fs";
import { parseArgs } from "node:util";

const USO = `uso: node gerar_anexo_testes.mjs --testes <testes.json> --saida <anexo.tex> [--titulo "..."]

testes.json: {gerado_em, revisao, suites: [{tipo, arquivo, area, camada?, descricao, total_testes?,
  versionado?, testes: [{nome, situacao}]}], scripts: [{arquivo, ferramenta, suites_plano[], objetivo, invocacao}]}
tipo é a ferramenta (jest, vitest, pytest, playwright, cypress, junit, xctest...).`;

const { values: op } = parseArgs({
  options: {
    testes: { type: "string" },
    saida: { type: "string" },
    titulo: { type: "string", default: "Catálogo dos testes automatizados" },
    ajuda: { type: "boolean", short: "h" },
  },
});
if (op.ajuda || !op.testes || !op.saida) {
  console.log(USO);
  process.exit(op.ajuda ? 0 : 1);
}

const j = JSON.parse(fs.readFileSync(op.testes, "utf8"));
const B = String.fromCharCode(92);
const esc = (t) =>
  String(t ?? "")
    .split(B)
    .join("\u0000")
    .replace(/([%&#_${}])/g, (c) => B + c)
    .replace(/\^/g, B + "textasciicircum{}")
    .replace(/~/g, B + "textasciitilde{}")
    .replace(/\u0000/g, B + "textbackslash{}")
    .replace(/[“”]/g, '"')
    .replace(/"([^"]*)"/g, B + "enquote{$1}")
    .replace(/</g, B + "textless{}")
    .replace(/>/g, B + "textgreater{}")
    .replace(/→/g, "$" + B + "rightarrow$")
    .replace(/≥/g, "$" + B + "geq$")
    .replace(/≤/g, "$" + B + "leq$");
const arq = (p) => B + "arq{" + String(p).replace(/[%#\\{}]/g, "") + "}";
const cod = (p) =>
  String(p)
    .replace(/[%#\\{}]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((s) => B + "cod{" + s + "}")
    .join(" ");

const NOME_TIPO = {
  jest: "Testes unitários e de componente (Jest)",
  vitest: "Testes unitários e de componente (Vitest)",
  mocha: "Testes unitários (Mocha)",
  pytest: "Testes automatizados (pytest)",
  unittest: "Testes automatizados (unittest)",
  junit: "Testes automatizados (JUnit)",
  xctest: "Testes automatizados (XCTest)",
  go: "Testes automatizados (go test)",
  rspec: "Testes automatizados (RSpec)",
  playwright: "Testes de ponta a ponta (Playwright)",
  cypress: "Testes de ponta a ponta (Cypress)",
  detox: "Testes de ponta a ponta (Detox)",
  maestro: "Testes de ponta a ponta (Maestro)",
};
const aprovado = (s) => !s || s === "passed" || s === "passou";

const suites = j.suites ?? [];
const tipos = [...new Set(suites.map((s) => s.tipo))];
const contagem = tipos.map((tipo) => {
  const doTipo = suites.filter((s) => s.tipo === tipo);
  const testes = doTipo.reduce(
    (n, s) => n + (s.testes?.length ?? s.total_testes ?? 0),
    0,
  );
  const falhas = doTipo.reduce(
    (n, s) => n + (s.testes ?? []).filter((t) => !aprovado(t.situacao)).length,
    0,
  );
  return { tipo, arquivos: doTipo.length, testes, falhas };
});

const L = [];
L.push(B + "chapter{" + esc(op.titulo) + "}" + B + "label{anexo:testes}", "");
const origem = [
  j.revisao && "revisão " + cod(j.revisao),
  j.gerado_em && esc(j.gerado_em),
]
  .filter(Boolean)
  .join(", ");
const totais = contagem
  .map(
    (c) =>
      B +
      "numero{" +
      c.arquivos +
      "} arquivos e " +
      B +
      "numero{" +
      c.testes +
      "} testes de " +
      esc(c.tipo) +
      (c.falhas ? " (" + c.falhas + " sem aprovação)" : ""),
  )
  .join("; ");
const scripts = j.scripts ?? [];
L.push(
  "Lista gerada automaticamente a partir dos resultados de execução registrados" +
    (origem ? " (" + origem + ")" : "") +
    ". " +
    "Totais: " +
    totais +
    (scripts.length
      ? "; " +
        B +
        "numero{" +
        scripts.length +
        "} scripts de sondagem, carga e verificação"
      : "") +
    ". Os nomes dos testes são reproduzidos como estão no código, sem tradução nem correção.",
  "",
);

for (const tipo of tipos) {
  L.push(
    B + "section{" + esc(NOME_TIPO[tipo] ?? "Testes (" + tipo + ")") + "}",
  );
  const doTipo = suites.filter((s) => s.tipo === tipo);
  for (const area of [...new Set(doTipo.map((s) => s.area ?? "geral"))]) {
    L.push(B + "subsection{" + esc(area) + "}");
    for (const s of doTipo.filter((x) => (x.area ?? "geral") === area)) {
      const n = s.testes?.length ?? s.total_testes;
      L.push(
        B +
          "subsubsection*{" +
          esc(String(s.arquivo).replace(/.*\//, "")) +
          "}",
      );
      L.push(
        arq(s.arquivo) +
          (s.camada ? " " + B + "textperiodcentered{} " + esc(s.camada) : "") +
          (s.versionado === false
            ? " " + B + "textperiodcentered{} não versionado"
            : "") +
          (typeof n === "number"
            ? " " +
              B +
              "textperiodcentered{} " +
              n +
              (n === 1 ? " teste" : " testes")
            : ""),
        "",
      );
      if (s.descricao) L.push(esc(s.descricao), "");
      if (s.testes?.length) {
        L.push(B + "begin{itemize}[nosep,leftmargin=1.3em]");
        for (const te of s.testes)
          L.push(
            B +
              "item " +
              esc(te.nome) +
              (aprovado(te.situacao) ? "" : " (" + esc(te.situacao) + ")"),
          );
        L.push(B + "end{itemize}", "");
      }
    }
  }
}

if (scripts.length) {
  const cab = [
    B + "toprule",
    B +
      "linhacab " +
      B +
      "cab{Arquivo} & " +
      B +
      "cab{Suítes} & " +
      B +
      "cab{Objetivo e invocação}" +
      B +
      B,
    B + "midrule",
  ];
  L.push(B + "section{Scripts de sondagem, carga e verificação}", "");
  L.push(B + "begin{longtable}{L{4.1cm}L{1.5cm}L{8.6cm}}");
  L.push(B + "caption{Scripts de sondagem, carga e verificação}" + B + B);
  L.push(
    ...cab,
    B + "endfirsthead",
    ...cab,
    B + "endhead",
    B + "bottomrule",
    B + "endfoot",
  );
  for (const s of scripts) {
    L.push(
      arq(s.arquivo) +
        (s.ferramenta
          ? B + "newline{" + B + "scriptsize " + esc(s.ferramenta) + "}"
          : "") +
        " & " +
        esc((s.suites_plano ?? []).join(", ") || "—") +
        " & " +
        esc(s.objetivo ?? "") +
        (s.invocacao
          ? B + "newline " + cod(String(s.invocacao).replace(/\s*\(.*$/, ""))
          : "") +
        B +
        B,
    );
  }
  L.push(B + "end{longtable}");
}

fs.writeFileSync(op.saida, L.join("\n"), "utf8");
console.log(
  JSON.stringify({
    tipos: contagem,
    scripts: scripts.length,
    linhas: L.length,
  }),
);
