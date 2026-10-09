const { spawnSync } = require('node:child_process');
const { readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const raiz = join(__dirname, '..', 'supabase', 'functions');
const config = join(raiz, 'deno.json');

const entradas = readdirSync(raiz, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => join(raiz, d.name, 'index.ts'))
  .filter((arquivo) => existsSync(arquivo));

const versao = spawnSync('deno', ['--version'], { stdio: 'ignore' });
if (versao.status !== 0) {
  console.warn(
    'functions-check: deno não encontrado no PATH — as Edge Functions não foram checadas. ' +
      'Instale o Deno para pegar erro de sintaxe antes do deploy.'
  );
  process.exit(0);
}

const resultado = spawnSync('deno', ['check', '--config', config, ...entradas], {
  stdio: 'inherit',
});

if (resultado.status !== 0) {
  console.error(`functions-check: ${entradas.length} função(ões) checada(s), com erro.`);
  process.exit(resultado.status ?? 1);
}

console.log(`functions-check: ${entradas.length} função(ões) OK.`);
