import { gql, repositorio } from './github.mjs';

const BRANCH_DE_HOMOLOGACAO = 'stage';

const [numero, nome, base = BRANCH_DE_HOMOLOGACAO] = process.argv.slice(2);

if (!numero || !nome) {
  console.error(
    `uso: npm run fluxo:branch -- <número da issue> <tipo/issue-slug> [base, padrão ${BRANCH_DE_HOMOLOGACAO}]`
  );
  process.exitCode = 1;
} else {
  const { dono, repo } = repositorio();
  const { repository } = await gql(
    `query($dono: String!, $repo: String!, $numero: Int!, $base: String!) {
      repository(owner: $dono, name: $repo) {
        id
        issue(number: $numero) { id title linkedBranches(first: 10) { nodes { ref { name } } } }
        ref(qualifiedName: $base) { target { oid } }
      }
    }`,
    { dono, repo, numero: Number(numero), base: `refs/heads/${base}` }
  );

  if (!repository.issue) throw new Error(`issue #${numero} não encontrada em ${dono}/${repo}`);
  if (!repository.ref) throw new Error(`branch ${base} não encontrada em ${dono}/${repo}`);

  const jaLigada = repository.issue.linkedBranches.nodes.some((n) => n.ref && n.ref.name === nome);
  if (jaLigada) {
    console.log(`${nome} já está ligada à #${numero}`);
  } else {
    await gql(
      `mutation($issue: ID!, $repo: ID!, $oid: GitObjectID!, $nome: String!) {
        createLinkedBranch(input: { issueId: $issue, repositoryId: $repo, oid: $oid, name: $nome }) {
          linkedBranch { ref { name } }
        }
      }`,
      { issue: repository.issue.id, repo: repository.id, oid: repository.ref.target.oid, nome }
    );
    console.log(
      `${nome} criada a partir de ${base} e ligada à #${numero} (${repository.issue.title})`
    );
  }
}
