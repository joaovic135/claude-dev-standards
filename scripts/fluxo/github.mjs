import { execFileSync } from 'node:child_process';

const AMBIENTE = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  const saida = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
    env: AMBIENTE,
  });
  const linha = saida.split('\n').find((l) => l.startsWith('password='));
  if (!linha) {
    throw new Error(
      'sem credencial: defina GITHUB_TOKEN ou autentique o git no github.com por HTTPS'
    );
  }
  return linha.slice('password='.length).trim();
}

export function repositorio() {
  const remoto = execFileSync('git', ['remote', 'get-url', 'origin'], {
    encoding: 'utf8',
    env: AMBIENTE,
  }).trim();
  const encontrado = remoto.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!encontrado) throw new Error(`origin não é um repositório do GitHub: ${remoto}`);
  return { dono: encontrado[1], repo: encontrado[2] };
}

let autorizacao;

export async function gql(query, variables) {
  autorizacao ??= `Bearer ${token()}`;
  const resposta = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: autorizacao, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await resposta.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}
