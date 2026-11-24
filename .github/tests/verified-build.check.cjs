// Codex (GPT-6 AI agent), November 23, 2026.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const find = require('../scripts/find-verified-build.cjs');

function fixture() {
  const output = {};
  const pr = { number: 44, merged_at: 'merged', merge_commit_sha: 'main-sha', base: { ref: 'main' }, head: { sha: 'head-sha', repo: { full_name: 'owner/repo' } } };
  const run = { id: 7, head_sha: 'head-sha', event: 'pull_request', conclusion: 'success', head_repository: { full_name: 'owner/repo' }, pull_requests: [{ number: 44 }] };
  const context = { eventName: 'push', ref: 'refs/heads/main', sha: 'main-sha', repo: { owner: 'owner', repo: 'repo' } };
  let artifacts = [{ name: 'verified-site', expired: false }];
  const github = {
    repos: { listPullRequestsAssociatedWithCommit: async () => ({ data: [pr] }) },
    actions: {
      listWorkflowRuns: async args => {
        assert.equal(args.workflow_id, 'deploy.yml');
        assert.equal(args.head_sha, pr.head.sha);
        return { data: { workflow_runs: [run] } };
      },
      listWorkflowRunArtifacts: async () => ({ data: { artifacts } }),
    },
  };
  const core = { info() {}, setOutput: (key, value) => { output[key] = value; } };
  return { pr, run, context, output, execute: () => find({ github, context, core }), expire: () => { artifacts[0].expired = true; } };
}

test('reuse candidate requires an exact merged same-repository PR', async () => {
  for (const alter of [f => { f.pr.merged_at = null; }, f => { f.pr.merge_commit_sha = 'other'; }, f => { f.pr.head.repo.full_name = 'fork/repo'; }]) {
    const f = fixture(); alter(f); await f.execute(); assert.deepEqual(f.output, {});
  }
  const f = fixture(); await f.execute(); assert.deepEqual(f.output, { 'run-id': '7' });
  const merged = fixture(); merged.run.pull_requests = []; await merged.execute(); assert.deepEqual(merged.output, { 'run-id': '7' });
});

test('wrong SHA, failed checks, other repository/event, or unrelated PR cannot supply an artifact', async () => {
  for (const alter of [f => { f.run.head_sha = 'old'; }, f => { f.run.conclusion = 'failure'; }, f => { f.run.event = 'push'; }, f => { f.run.head_repository.full_name = 'fork/repo'; }, f => { f.run.pull_requests = [{ number: 99 }]; }]) {
    const f = fixture(); alter(f); await f.execute(); assert.deepEqual(f.output, {});
  }
});

test('expired artifacts and PR-triggered builds use full validation', async () => {
  const expired = fixture(); expired.expire(); await expired.execute(); assert.deepEqual(expired.output, {});
  const pr = fixture(); pr.context.eventName = 'pull_request'; await pr.execute(); assert.deepEqual(pr.output, {});
});
