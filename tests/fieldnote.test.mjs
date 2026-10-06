import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve, join } from 'node:path';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT, load, validate, markdown } from '../tools/fieldnote.mjs';
const fresh = () => load(resolve(ROOT, 'examples/dialogue.fieldnote.yaml'));

test('YAML and JSON examples match and validate', () => {
  assert.deepEqual(fresh(), load(resolve(ROOT, 'examples/dialogue.fieldnote.json')));
  assert.deepEqual(validate(fresh()), []);
});
test('decided requires an answer', () => {
  const record = fresh(); record.decisions[0].status = 'decided';
  assert.ok(validate(record).length);
});
test('not applicable requires a reason', () => {
  const record = fresh(); record.decisions[0].status = 'not-applicable';
  assert.ok(validate(record).length);
});
test('duplicate IDs are rejected', () => {
  const record = fresh(); record.decisions.push(structuredClone(record.decisions[0]));
  assert.ok(validate(record).includes('decisions: duplicate IDs'));
});
test('unknown decision references are rejected', () => {
  const record = fresh(); record.checks[0].decisions = ['missing'];
  assert.ok(validate(record).length);
});
test('Markdown preserves open decisions and matches the shipped documentation', () => {
  const doc = markdown(fresh());
  assert.ok(doc.includes('**open**'));
  assert.ok(doc.includes('verification results'));
  assert.equal(`${doc}\n`, readFileSync(resolve(ROOT, 'examples/dialogue.accessibility.md'), 'utf8'));
});
test('custom decisions need no questions and render using IDs', () => {
  const record = load(resolve(ROOT, 'examples/custom.fieldnote.yaml'));
  assert.deepEqual(validate(record), []);
  assert.ok(markdown(record).includes('remove-filter'));
  assert.ok(markdown(record).includes('removal-feedback'));
});
test('older schema versions require migration', () => {
  const record = fresh(); record.schemaVersion = '0.1.0';
  assert.ok(validate(record).length);
});
test('the current version accepts omitted questions', () => {
  const record = fresh(); delete record.decisions[0].question;
  assert.deepEqual(validate(record), []);
});
test('unknown versions and non-record input are rejected', () => {
  const record = fresh(); record.schemaVersion = '../../missing';
  assert.ok(validate(record).length);
  assert.ok(validate(null).length);
});
test('results require environment and revision and validate date-time formats', () => {
  const record = { schemaVersion: '0.1.1', fieldnote: 'dialogue.fieldnote.yaml', componentRevision: 'abc123', results: [{ check: 'initial-focus-check', outcome: 'passed', observedAt: '2026-10-06T10:00:00Z', environment: 'Firefox, keyboard', evidence: 'Focused Cancel on opening.' }] };
  assert.deepEqual(validate(record, true), []);
  const invalidDate = structuredClone(record); invalidDate.results[0].observedAt = 'yesterday';
  assert.ok(validate(invalidDate, true).length);
  const missingRevision = structuredClone(record); delete missingRevision.componentRevision;
  assert.ok(validate(missingRevision, true).length);
  delete record.results[0].environment;
  assert.ok(validate(record, true).length);
});
test('CLI exit codes distinguish valid, invalid, unreadable, malformed, and unsupported requests', () => {
  const dir = mkdtempSync(join(tmpdir(), 'afs-'));
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const cli = (...args) => spawnSync(process.execPath, [resolve(ROOT, 'tools/fieldnote.mjs'), ...args], { encoding: 'utf8', env });
  try {
    assert.equal(cli('validate', resolve(ROOT, 'examples/custom.fieldnote.yaml')).status, 0);
    const invalid = fresh(); invalid.decisions[0].status = 'decided';
    writeFileSync(join(dir, 'invalid.json'), JSON.stringify(invalid));
    assert.equal(cli('validate', join(dir, 'invalid.json')).status, 1);
    writeFileSync(join(dir, 'malformed.yaml'), 'decisions: [');
    assert.equal(cli('validate', join(dir, 'malformed.yaml')).status, 1);
    assert.equal(cli('validate', join(dir, 'missing.yaml')).status, 1);
    assert.equal(cli('render', '--results', 'any.json').status, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
