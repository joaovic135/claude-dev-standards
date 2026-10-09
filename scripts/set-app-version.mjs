import { readFileSync, writeFileSync } from 'node:fs';

const VERSAO_DE_LOJA = /^\d+\.\d+\.\d+$/;

const [versao, caminho = 'app.json'] = process.argv.slice(2);

if (!versao || !VERSAO_DE_LOJA.test(versao)) {
  console.error(
    `[set-app-version] versão inválida: "${versao ?? ''}". As lojas exigem MAJOR.MINOR.PATCH numérico, sem sufixo.`
  );
  process.exit(1);
}

const config = JSON.parse(readFileSync(caminho, 'utf8'));
if (!config.expo || typeof config.expo !== 'object') {
  console.error(`[set-app-version] ${caminho} não tem a chave "expo".`);
  process.exit(1);
}

const anterior = config.expo.version;
config.expo.version = versao;
writeFileSync(caminho, `${JSON.stringify(config, null, 2)}\n`);
console.log(`[set-app-version] ${caminho}: ${anterior ?? '(sem versão)'} → ${versao}`);
