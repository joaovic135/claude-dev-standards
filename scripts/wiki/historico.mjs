import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGINA_DE_RELEASE = 'Release e CI';
const PAGINA_DE_DECISOES = 'Decisões e armadilhas';

const pasta = process.argv[2] ?? '.wiki';
const destino = join(pasta, 'Histórico-de-versões.md');

const changelog = readFileSync('CHANGELOG.md', 'utf8').split(/\r?\n/);

const corpo = [];
for (const linha of changelog) {
  if (/^# /.test(linha)) continue;
  const versao = /^## \[([^\]]+)\]\(([^)]+)\)\s*\(([^)]+)\)/.exec(linha);
  if (versao) {
    corpo.push(`## ${versao[1]} — ${versao[3]} ([comparar](${versao[2]}))`);
    continue;
  }
  const versaoSemLink = /^## ([0-9][^ ]*)\s*\(([^)]+)\)/.exec(linha);
  if (versaoSemLink) {
    corpo.push(`## ${versaoSemLink[1]} — ${versaoSemLink[2]}`);
    continue;
  }
  if (/^\* /.test(linha)) {
    corpo.push(`- ${linha.slice(2)}`);
    continue;
  }
  corpo.push(linha);
}

const cabecalho = [
  '> Versões publicadas, da mais nova para a mais antiga. Esta página é gerada do `CHANGELOG.md` pelo job `Atualizar wiki` a cada release; não edite à mão. Só commits `feat:`, `fix:`, `perf:` e `revert:` aparecem aqui — o resto (`chore:`, `docs:`, `test:`) não gera versão.',
  '',
  `Como a versão vira release está em [[${PAGINA_DE_RELEASE}]].`,
  '',
];

const rodape = [
  '',
  '## Veja também',
  '',
  `- [[${PAGINA_DE_RELEASE}]]`,
  `- [[${PAGINA_DE_DECISOES}]]`,
  '',
  '<!-- fontes:',
  'CHANGELOG.md',
  '-->',
  '',
];

const texto = [...cabecalho, ...corpo, ...rodape].join('\n').replace(/\n{3,}/g, '\n\n');

writeFileSync(destino, texto, 'utf8');
console.log(`Histórico de versões gravado em ${destino}`);
