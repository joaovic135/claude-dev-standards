const { execSync } = require('child_process');

const ALLOWLIST = {
  'GHSA-w3rx-r6r6-pgpr':
    'image-size (via metro): parser ICNS roda só em build time sobre assets do próprio repo; nenhuma versão corrigida publicada (<=2.0.2)',
  'GHSA-5p2g-fcmc-qvqq':
    'image-size (via metro): parsers JXL/HEIF, mesma superfície e mesma ausência de correção',
  'GHSA-86w9-cpqp-85rv':
    'node-forge (via @expo/cli e @expo/code-signing-certificates): só o CLI em dev/build usa, para gerar certificados; a falha é em verificação de assinatura RSA, que o CLI não faz sobre entrada de terceiros; nenhuma versão corrigida (<=1.4.0 é a última)',
  'GHSA-vfj7-8cjw-p6xm':
    'braces (via micromatch em jest, metro e @semantic-release/git): expande globs do próprio repo em teste, build e release; não entra no bundle; nenhuma versão corrigida (<=3.0.3 é a última)',
  'GHSA-ch52-4w7c-c8xp':
    'http-cache-semantics (via @expo/ngrok, túnel de dev, e o CLI npm do release): cache HTTP de cliente de linha de comando, sem usuários concorrentes; não entra no bundle; nenhuma versão corrigida (<=4.2.0 é a última)',
};
const FAIL_ON = new Set(['high', 'critical']);

const BUNDLED_CLI_PREFIXES = ['node_modules/npm/node_modules/'];

function soDentroDeCliEmpacotado(nodes) {
  return (
    nodes.length > 0 &&
    nodes.every((node) => BUNDLED_CLI_PREFIXES.some((prefix) => node.startsWith(prefix)))
  );
}

let raw;
try {
  raw = execSync('npm audit --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
} catch (err) {
  raw = err.stdout;
}

const report = JSON.parse(raw);
const failing = new Set();
const allowed = new Set();
const bundled = new Set();

for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  if (soDentroDeCliEmpacotado(vuln.nodes ?? [])) {
    bundled.add(`${vuln.name} (${vuln.nodes.join(', ')})`);
    continue;
  }
  for (const via of vuln.via) {
    if (typeof via !== 'object' || !FAIL_ON.has(via.severity)) continue;
    const id = via.url.split('/').pop();
    if (ALLOWLIST[id]) {
      allowed.add(`${id} ${via.name}`);
      continue;
    }
    failing.add(`${via.severity.toUpperCase()} ${via.name} ${id} — ${via.title}`);
  }
}

for (const entry of allowed) console.log(`audit: ignorado por allowlist — ${entry}`);
for (const entry of bundled) {
  console.log(`audit: ignorado por caminho (dependência empacotada do CLI npm) — ${entry}`);
}

if (failing.size > 0) {
  console.error('audit: vulnerabilidades high/critical fora da allowlist:');
  for (const entry of failing) console.error(`  ${entry}`);
  process.exit(1);
}

console.log('audit: nenhuma vulnerabilidade high/critical fora da allowlist');
