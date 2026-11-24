// Codex (GPT-6 AI agent), November 23, 2026.
// Only successful checks of the exact merged, same-repository PR are eligible.
module.exports = async ({ github, context, core }) => {
  if (context.eventName !== 'push' || context.ref !== 'refs/heads/main') return;
  const repo = context.repo;
  const { data: pulls } = await github.repos.listPullRequestsAssociatedWithCommit({ ...repo, commit_sha: context.sha });
  const pr = pulls.find(p => p.merged_at && p.merge_commit_sha === context.sha && p.base.ref === 'main'
    && p.head.repo?.full_name === `${repo.owner}/${repo.repo}`);
  if (!pr) { core.info('No eligible merged PR; run full validation.'); return; }
  const { data } = await github.actions.listWorkflowRuns({ ...repo, workflow_id: 'deploy.yml',
    event: 'pull_request', head_sha: pr.head.sha, status: 'success', per_page: 10 });
  for (const run of data.workflow_runs) {
    if (run.event !== 'pull_request' || run.conclusion !== 'success' || run.head_sha !== pr.head.sha
      || run.head_repository?.full_name !== `${repo.owner}/${repo.repo}`
      // GitHub clears this run field after merge. The merged-commit PR lookup above
      // plus exact head SHA/repository/workflow still establish provenance.
      || !Array.isArray(run.pull_requests)
      || (run.pull_requests.length && !run.pull_requests.some(p => p.number === pr.number))) continue;
    const artifacts = await github.actions.listWorkflowRunArtifacts({ ...repo, run_id: run.id });
    if (artifacts.data.artifacts.some(a => a.name === 'verified-site' && !a.expired)) {
      core.setOutput('run-id', String(run.id));
      core.info(`Candidate verified build from PR #${pr.number}, run ${run.id}; tree must still match.`);
      return;
    }
  }
  core.info('No successful PR artifact found; run full validation.');
};
