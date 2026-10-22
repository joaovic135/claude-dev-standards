import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pasta = process.argv[2] ?? '.wiki';
const ESPECIAIS = new Set(['Home.md', '_Sidebar.md', '_Footer.md']);

const arquivos = readdirSync(pasta)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.normalize('NFC'));
const porNome = new Map(arquivos.map((f) => [f.slice(0, -3), f]));

const erros = [];
const avisos = [];
const referenciadas = new Set();

function arquivoDoLink(alvo) {
  const nome = alvo.normalize('NFC').trim();
  return porNome.get(nome.replace(/ /g, '-')) ?? porNome.get(nome) ?? null;
}

for (const arquivo of arquivos) {
  const texto = readFileSync(join(pasta, arquivo), 'utf8');
  const semCodigo = texto.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

  for (const [, link] of semCodigo.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const alvo = link.includes('|') ? link.split('|').pop() : link;
    const encontrado = arquivoDoLink(alvo);
    if (encontrado) referenciadas.add(encontrado);
    else erros.push(`${arquivo}: [[${link}]] não encontra página`);
  }

  for (const [, destino] of semCodigo.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(destino)) continue;
    avisos.push(
      `${arquivo}: link relativo "${destino}" — use [[Título da página]] para páginas do wiki`
    );
  }

  if (ESPECIAIS.has(arquivo)) continue;

  if (!/<!--\s*fontes:/.test(texto)) erros.push(`${arquivo}: sem bloco <!-- fontes: -->`);
  if (!/^>\s/.test(texto.trimStart()))
    avisos.push(`${arquivo}: não começa com o resumo em citação (> ...)`);
  if (/^# /m.test(semCodigo))
    avisos.push(`${arquivo}: tem título de nível 1; o GitHub já mostra o nome da página`);
}

for (const arquivo of arquivos) {
  if (!ESPECIAIS.has(arquivo) && !referenciadas.has(arquivo)) {
    avisos.push(`${arquivo}: nenhuma página linka para ela`);
  }
}

for (const aviso of avisos) console.log(`aviso: ${aviso}`);
for (const erro of erros) console.error(`erro: ${erro}`);
console.log(`${arquivos.length} páginas, ${erros.length} erros, ${avisos.length} avisos`);
process.exit(erros.length ? 1 : 0);
