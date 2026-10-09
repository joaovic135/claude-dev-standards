import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

const PLUGINS_DE_ANALISE = new Set([
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
]);
const MARCADOR = '<!-- release-preview -->';

const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
const config = JSON.parse(readFileSync('.releaserc.json', 'utf8'));
const plugins = config.plugins.filter((plugin) =>
  PLUGINS_DE_ANALISE.has(Array.isArray(plugin) ? plugin[0] : plugin)
);

const VARIAVEIS_DO_CI = [
  'GITHUB_ACTIONS',
  'GITHUB_REF',
  'GITHUB_HEAD_REF',
  'GITHUB_BASE_REF',
  'GITHUB_EVENT_NAME',
];
const envSemCi = Object.fromEntries(
  Object.entries(process.env).filter(([nome]) => !VARIAVEIS_DO_CI.includes(nome))
);

const resultado = await semanticRelease(
  { branches: [branch], tagFormat: config.tagFormat, dryRun: true, ci: false, plugins },
  {
    cwd: process.cwd(),
    env: { ...envSemCi, GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? 'preview' },
  }
);

const corpo = resultado
  ? [
      MARCADOR,
      `## Release prevista: \`${resultado.lastRelease.version || 'nenhuma'}\` → \`${resultado.nextRelease.version}\` (${resultado.nextRelease.type})`,
      '',
      'Ao fundir esta PR em `main`, o workflow cria a tag, a Release no GitHub e os builds de loja com esta versão.',
      '',
      resultado.nextRelease.notes,
    ].join('\n')
  : [
      MARCADOR,
      '## Sem release prevista',
      '',
      'Nenhum commit `feat:` ou `fix:` desde a última tag `v*`. Ao fundir esta PR, o workflow não cria versão nem build de loja.',
    ].join('\n');

console.log(`\n${corpo}`);

const saida = process.env.RELEASE_PREVIEW_OUT;
if (saida) {
  writeFileSync(saida, `${corpo}\n`);
  console.log(`\n[release:preview] comentário salvo em ${saida}`);
}
