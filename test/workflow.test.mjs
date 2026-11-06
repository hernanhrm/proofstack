import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'node_modules/@fission-ai/openspec/bin/openspec.js');
const sample = join(root, 'openspec/changes/portable-review-pilot');
const customNames = ['reviewing-with-humans', 'writing-test-guides'];

function sandbox(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'portable-openspec-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, 'openspec'), { recursive: true });
  cpSync(join(root, 'openspec/config.yaml'), join(cwd, 'openspec/config.yaml'));
  cpSync(join(root, 'openspec/schemas'), join(cwd, 'openspec/schemas'), { recursive: true });
  cpSync(join(root, 'profile'), join(cwd, '.config'), { recursive: true });
  return cwd;
}

function run(cwd, args, expectedExit = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd, encoding: 'utf8',
    env: { ...process.env, OPENSPEC_TELEMETRY: '0', DO_NOT_TRACK: '1', OPENSPEC_NO_UPDATE_CHECK: '1',
      XDG_CONFIG_HOME: join(cwd, '.config'), XDG_DATA_HOME: join(cwd, '.data') },
  });
  assert.equal(result.status, expectedExit, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function json(cwd, args) { return JSON.parse(run(cwd, [...args, '--json'])); }
function seed(cwd, name = 'trial') {
  run(cwd, ['new', 'change', name]);
  const dir = join(cwd, 'openspec/changes', name);
  for (const file of ['proposal.md', 'specs', 'tasks.md']) {
    cpSync(join(sample, file), join(dir, file), { recursive: true });
  }
  return dir;
}

test('schema exposes plan readiness, executable context and honest task progress', t => {
  const cwd = sandbox(t);
  assert.equal(json(cwd, ['schema', 'validate', 'human-steered']).valid, true);
  run(cwd, ['new', 'change', 'trial']);
  const dir = join(cwd, 'openspec/changes/trial');
  const status = () => json(cwd, ['status', '--change', 'trial']);
  const statuses = () => status().artifacts.map(a => [a.id, a.status]);
  assert.deepEqual(statuses(), [['proposal', 'ready'], ['specs', 'blocked'], ['tasks', 'blocked']]);
  assert.equal(json(cwd, ['instructions', 'apply', '--change', 'trial']).state, 'blocked');
  const proposal = json(cwd, ['instructions', 'proposal', '--change', 'trial']);
  assert.match(proposal.template, /## How/);
  assert.match(proposal.context, /Challenge consequential choices/);
  assert.ok(proposal.rules.some(r => r.includes('350 words')));
  cpSync(join(sample, 'proposal.md'), join(dir, 'proposal.md'));
  assert.deepEqual(statuses(), [['proposal', 'done'], ['specs', 'ready'], ['tasks', 'blocked']]);
  cpSync(join(sample, 'specs'), join(dir, 'specs'), { recursive: true });
  assert.deepEqual(statuses(), [['proposal', 'done'], ['specs', 'done'], ['tasks', 'ready']]);
  writeFileSync(join(dir, 'tasks.md'), '# Tasks\n- [ ] Implement and test (AC1)\n- [x] Prepare fixtures (AC2)\n');
  const apply = json(cwd, ['instructions', 'apply', '--change', 'trial']);
  assert.equal(apply.state, 'ready');
  assert.deepEqual(apply.progress, { total: 2, complete: 1, remaining: 1 });
  assert.deepEqual(Object.keys(apply.contextFiles).sort(), ['proposal', 'specs', 'tasks']);
  assert.ok(apply.operationGuidance.some(g => g.includes('exact revision/content digest')));
  assert.ok(apply.operationGuidance.some(g => g.includes('independent reviewer-agent')));
  assert.equal(status().isPlanningComplete, true);
  // Planning files exist, but implementation still has an unchecked task.
  assert.equal(apply.progress.remaining, 1);
  assert.equal(existsSync(join(dir, 'evidence.md')), false);
});

test('strict validation rejects malformed scenarios; archive syncs valid specs and retains evidence', t => {
  const cwd = sandbox(t);
  const dir = seed(cwd);
  assert.match(run(cwd, ['validate', 'trial', '--strict']), /valid/i);
  const specPath = join(dir, 'specs/portable-change-review/spec.md');
  const validSpec = readFileSync(specPath, 'utf8');
  writeFileSync(specPath, validSpec.replaceAll('#### Scenario:', '### Scenario:'));
  run(cwd, ['validate', 'trial', '--strict'], 1);
  writeFileSync(specPath, validSpec);
  writeFileSync(join(dir, 'tasks.md'), '# Tasks\n- [x] Complete fixture implementation and tests\n');
  writeFileSync(join(dir, 'evidence.md'), '# Evidence\nFixture only; human acceptance pending.\n');
  run(cwd, ['archive', 'trial', '--yes']);
  const archived = readdirSync(join(cwd, 'openspec/changes/archive')).find(n => n.endsWith('-trial'));
  assert.ok(archived);
  assert.match(readFileSync(join(cwd, 'openspec/changes/archive', archived, 'evidence.md'), 'utf8'), /human acceptance pending/);
  assert.match(readFileSync(join(cwd, 'openspec/specs/portable-change-review/spec.md'), 'utf8'), /AC1 — OpenSpec owns delivery/);
  run(cwd, ['validate', '--specs', '--strict']);
});

test('documentation-only changes skip specs without inventing requirements', t => {
  const cwd = sandbox(t);
  run(cwd, ['new', 'change', 'docs-only']);
  const dir = join(cwd, 'openspec/changes/docs-only');
  writeFileSync(join(dir, '.openspec.yaml'), 'schema: human-steered\nskip_specs: true\n');
  writeFileSync(join(dir, 'proposal.md'), '# Wording cleanup\nNo behavior changes.\n');
  const status = json(cwd, ['status', '--change', 'docs-only']);
  assert.equal(status.artifacts.find(a => a.id === 'specs').status, 'skipped');
  assert.equal(status.artifacts.find(a => a.id === 'tasks').status, 'ready');
  writeFileSync(join(dir, 'tasks.md'), '# Tasks\n- [ ] Correct wording and inspect diff\n');
  assert.equal(json(cwd, ['instructions', 'apply', '--change', 'docs-only']).state, 'ready');
  run(cwd, ['validate', 'docs-only', '--strict']);
});

test('two custom skills work beside stock workflows for Codex and Claude Code', t => {
  const cwd = sandbox(t);
  const custom = readdirSync(join(root, '.agents/skills')).filter(n =>
    !n.startsWith('openspec-') && existsSync(join(root, '.agents/skills', n, 'SKILL.md'))).sort();
  assert.deepEqual(custom, customNames);
  for (const name of customNames) {
    const source = readFileSync(join(root, '.agents/skills', name, 'SKILL.md'), 'utf8');
    const metadata = parse(source.split('---')[1]);
    assert.equal(metadata.name, name);
    assert.ok(metadata.description.length < 1024);
    assert.doesNotMatch(source, /ampcode\.com|creating-views|proving-delivery|understanding-changes|designing-changes|implementing-changes/);
    for (const harness of ['.agents', '.claude']) {
      mkdirSync(join(cwd, harness, 'skills', name), { recursive: true });
      writeFileSync(join(cwd, harness, 'skills', name, 'SKILL.md'), source);
    }
  }
  run(cwd, ['init', '--tools', 'codex,claude', '--profile', 'custom', '--no-animation']);
  for (const harness of ['.agents', '.claude']) {
    for (const name of customNames) {
      assert.equal(readFileSync(join(cwd, harness, 'skills', name, 'SKILL.md'), 'utf8'),
        readFileSync(join(root, '.agents/skills', name, 'SKILL.md'), 'utf8'));
    }
    const skills = readdirSync(join(cwd, harness, 'skills')).filter(n =>
      existsSync(join(cwd, harness, 'skills', n, 'SKILL.md')));
    assert.ok(skills.includes('openspec-verify-change'));
    assert.ok(skills.includes('openspec-apply-change'));
    assert.equal(skills.length, 10); // Eight upstream workflows plus two custom skills.
  }
});
