import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const destino = 'src/types/database.ts';
const origem = process.argv.includes('--linked') ? '--linked' : '--local';

let saida;
try {
  saida = execSync(`npx supabase gen types typescript ${origem}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
} catch (erro) {
  console.error(`\n[db:types] supabase gen types falhou (${origem}); ${destino} não foi tocado.`);
  console.error('[db:types] Sem Docker, use: npm run db:types -- --linked');
  process.exit(erro.status ?? 1);
}

if (!saida.includes('export type Database')) {
  console.error(`\n[db:types] Saída sem 'export type Database'; ${destino} não foi tocado.`);
  process.exit(1);
}

writeFileSync(destino, saida);
console.log(`[db:types] ${destino} atualizado (${saida.split('\n').length} linhas).`);
