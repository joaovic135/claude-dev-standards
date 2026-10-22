import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const LIMITE_DO_DIFF = 400_000;
const IGNORADOS_NO_DIFF = [
  ':!package-lock.json',
  ':!CHANGELOG.md',
  ':!*.png',
  ':!*.jpg',
  ':!*.webp',
  ':!*.pdf',
];

const [tag, saidaArg, ...resto] = process.argv.slice(2);
if (!tag || !saidaArg) {
  console.error(
    'uso: node scripts/wiki/contexto.mjs <tag> <pasta-de-saida> [--wiki .wiki] [--prompt .github/wiki/prompt.md]'
  );
  process.exit(2);
}
const opcoes = { wiki: '.wiki', prompt: null };
for (let i = 0; i < resto.length; i += 2) {
  if (resto[i] === '--wiki') opcoes.wiki = resto[i + 1];
  if (resto[i] === '--prompt') opcoes.prompt = resto[i + 1];
}
const saida = resolve(saidaArg);
mkdirSync(saida, { recursive: true });

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

const tags = git('tag', '-l', 'v*', '--sort=-v:refname').split('\n').filter(Boolean);
const posicao = tags.indexOf(tag);
if (posicao < 0) {
  console.error(`tag ${tag} não existe; tags conhecidas: ${tags.slice(0, 5).join(', ')}`);
  process.exit(2);
}
const anterior = tags[posicao + 1] ?? null;
const base = anterior ?? git('rev-list', '--max-parents=0', tag).trim().split('\n').pop();

const commits = git('log', `${base}..${tag}`, '--no-merges', '--format=%h %s%n%b%n---');
const arquivosAlterados = git('diff', '--name-status', base, tag);
let diff = git('diff', base, tag, '--', '.', ...IGNORADOS_NO_DIFF);
if (diff.length > LIMITE_DO_DIFF) {
  diff =
    diff.slice(0, LIMITE_DO_DIFF) +
    `\n\n[diff truncado em ${LIMITE_DO_DIFF} caracteres; use git diff ${base} ${tag} -- <arquivo> para ver um arquivo inteiro]\n`;
}

const versao = tag.replace(/^v/, '');
const changelogInteiro = git('show', `${tag}:CHANGELOG.md`);
const inicio = changelogInteiro.indexOf(`## [${versao}]`);
let changelog = '';
if (inicio >= 0) {
  const fim = changelogInteiro.indexOf('\n## [', inicio + 1);
  changelog = changelogInteiro.slice(inicio, fim < 0 ? undefined : fim).trim();
}

const caminhos = arquivosAlterados
  .split('\n')
  .filter(Boolean)
  .map((linha) => linha.split('\t').pop());

function fontesDaPagina(texto) {
  const bloco = /<!--\s*fontes:\s*([\s\S]*?)-->/.exec(texto);
  if (!bloco) return [];
  return bloco[1]
    .split('\n')
    .map((l) => l.trim().split(/\s/)[0])
    .filter(Boolean);
}

function fonteCobre(fonte, caminho) {
  if (caminho === fonte) return true;
  const prefixo = fonte.endsWith('/') ? fonte : `${fonte}/`;
  return caminho.startsWith(prefixo);
}

const paginasAfetadas = [];
for (const arquivo of readdirSync(opcoes.wiki).filter((f) => f.endsWith('.md'))) {
  const fontes = fontesDaPagina(readFileSync(join(opcoes.wiki, arquivo), 'utf8'));
  const tocados = caminhos.filter((c) => fontes.some((f) => fonteCobre(f, c)));
  if (tocados.length) paginasAfetadas.push({ pagina: arquivo, arquivos: tocados });
}

writeFileSync(join(saida, 'commits.txt'), commits, 'utf8');
writeFileSync(join(saida, 'arquivos.txt'), arquivosAlterados, 'utf8');
writeFileSync(join(saida, 'diff.patch'), diff, 'utf8');
writeFileSync(join(saida, 'changelog.md'), changelog, 'utf8');
writeFileSync(
  join(saida, 'paginas-afetadas.txt'),
  paginasAfetadas.map((p) => `${p.pagina}: ${p.arquivos.join(', ')}`).join('\n') + '\n',
  'utf8'
);
writeFileSync(
  join(saida, 'resumo.json'),
  JSON.stringify({ tag, anterior, arquivos: caminhos.length, paginasAfetadas }, null, 2),
  'utf8'
);

if (opcoes.prompt) {
  const modelo = readFileSync(opcoes.prompt, 'utf8');
  const prompt = modelo
    .replaceAll('{{TAG}}', tag)
    .replaceAll('{{ANTERIOR}}', anterior ?? '(primeira versão)')
    .replaceAll('{{CONTEXTO}}', saida)
    .replaceAll(
      '{{PAGINAS_AFETADAS}}',
      paginasAfetadas.length
        ? paginasAfetadas.map((p) => `- ${p.pagina}: ${p.arquivos.join(', ')}`).join('\n')
        : '- (nenhuma página cita os arquivos alterados; avalie se algo novo merece página)'
    );
  writeFileSync(join(saida, 'prompt.txt'), prompt, 'utf8');
}

console.log(
  `${tag} desde ${anterior ?? 'o início'}: ${caminhos.length} arquivos, ${paginasAfetadas.length} páginas afetadas → ${saida}`
);
for (const p of paginasAfetadas) console.log(`  ${p.pagina}: ${p.arquivos.length} arquivo(s)`);
