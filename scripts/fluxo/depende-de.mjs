import { gql, repositorio } from './github.mjs';

const [numero, ...bloqueadoras] = process.argv.slice(2);

if (!numero || bloqueadoras.length === 0) {
  console.error('uso: npm run fluxo:depende -- <issue> <issue que bloqueia> [outras…]');
  process.exitCode = 1;
} else {
  const { dono, repo } = repositorio();
  const idDa = async (n) => {
    const { repository } = await gql(
      `query($dono: String!, $repo: String!, $n: Int!) { repository(owner: $dono, name: $repo) { issue(number: $n) { id } } }`,
      { dono, repo, n: Number(n) }
    );
    if (!repository.issue) throw new Error(`issue #${n} não encontrada em ${dono}/${repo}`);
    return repository.issue.id;
  };

  const issue = await idDa(numero);
  for (const bloqueadora of bloqueadoras) {
    await gql(
      `mutation($issue: ID!, $bloqueadora: ID!) {
        addBlockedBy(input: { issueId: $issue, blockingIssueId: $bloqueadora }) { issue { number } }
      }`,
      { issue, bloqueadora: await idDa(bloqueadora) }
    );
    console.log(`#${numero} agora depende de #${bloqueadora}`);
  }
}
