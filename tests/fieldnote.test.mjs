import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve, join } from 'node:path';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT, load, validate, validateResults, resolveConfiguration, markdown } from '../tools/fieldnote.mjs';
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
  const record = { schemaVersion: '0.2.0', fieldnote: 'dialogue.fieldnote.yaml', componentRevision: 'abc123', results: [{ check: 'initial-focus-check', outcome: 'passed', observedAt: '2026-10-06T10:00:00Z', environment: 'Firefox, keyboard', evidence: 'Focused Cancel on opening.' }] };
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
  const cli = (...args) => {
    const run = spawnSync(process.execPath, [resolve(ROOT, 'tools/fieldnote.mjs'), ...args], { encoding: 'utf8', env });
    assert.ifError(run.error); return run;
  };
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

test('benchmarks are optional and require name, version, and a valid URL', () => {
  const record = fresh();
  delete record.benchmarks;
  assert.deepEqual(validate(record), []);
  record.benchmarks = [{name:'WCAG',version:'2.2',url:'https://www.w3.org/TR/WCAG22/'}];
  assert.deepEqual(validate(record), []);
  for (const field of ['name','version','url']) {
    const missing = structuredClone(record); delete missing.benchmarks[0][field];
    assert.ok(validate(missing).length);
  }
  record.benchmarks[0].url='not a URL';
  assert.ok(validate(record).length);
});
test('benchmark versions accept dated drafts and render without claiming conformance', () => {
  const record=fresh();
  record.benchmarks=[{name:'Example draft benchmark',version:'Draft 2026-10-06',url:'https://example.org/draft/2026-10-06'}];
  assert.deepEqual(validate(record), []);
  assert.ok(markdown(record).includes('Example draft benchmark Draft 2026-10-06'));
  assert.ok(markdown(record).includes('not a conformance claim'));
});

const button = () => load(resolve(ROOT, 'examples/button.fieldnote.yaml'));
const buttonResults = () => load(resolve(ROOT, 'examples/button.results.json'));

test('flat records remain valid with no configurations or scopes', () => {
  const record = load(resolve(ROOT, 'examples/base/component.fieldnote.yaml'));
  assert.deepEqual(validate(record), []);
  assert.equal(record.configurations, undefined);
  assert.throws(() => resolveConfiguration(record, 'primary'), /Unknown configuration/);
});
test('scoped items need declared configuration IDs', () => {
  for (const key of ['decisions', 'responsibilities', 'limitations', 'checks']) {
    const record = button(); record[key][0].appliesTo = ['missing'];
    assert.ok(validate(record).some(error => error.includes('unknown configuration missing')), key);
  }
  const record = fresh(); record.decisions[0].appliesTo = ['primary'];
  assert.ok(validate(record).some(error => error.includes('unknown configuration')));
});
test('empty and duplicate scopes and duplicate configuration IDs are rejected', () => {
  for (const appliesTo of [[], ['primary', 'primary']]) {
    const record = button(); record.decisions[0].appliesTo = appliesTo;
    assert.ok(validate(record).length);
  }
  const record = button(); record.configurations.push(structuredClone(record.configurations[0]));
  assert.ok(validate(record).includes('configurations: duplicate IDs'));
});
test('decision IDs remain unique even across disjoint scopes', () => {
  const record = button();
  record.decisions.push({ ...record.decisions[0], appliesTo: ['secondary'] });
  assert.ok(validate(record).includes('decisions: duplicate IDs'));
});
test('a check cannot outscope a referenced decision', () => {
  const record = button();
  const check = record.checks.find(item => item.id === 'primary-contrast-check');
  check.appliesTo = ['secondary'];
  assert.ok(validate(record).some(error => error.includes('primary-contrast does not apply to secondary')));
  delete check.appliesTo;
  assert.ok(validate(record).some(error => error.includes('does not apply to')));
});
test('configuration resolution includes shared decisions once and only the selected specifics', () => {
  const source = button(); const before = structuredClone(source);
  for (const id of ['primary', 'secondary']) {
    const selected = resolveConfiguration(source, id);
    assert.deepEqual(validate(selected), []);
    assert.equal(selected.decisions.filter(item => item.id === 'element').length, 1);
    assert.ok(selected.decisions.some(item => item.id === `${id}-contrast`));
    assert.ok(!selected.decisions.some(item => item.id === `${id === 'primary' ? 'secondary' : 'primary'}-contrast`));
    assert.deepEqual(selected.configurations.map(item => item.id), [id]);
    assert.ok(selected.decisions.every(item => !item.appliesTo || item.appliesTo.length === 1 && item.appliesTo[0] === id));
  }
  assert.deepEqual(source, before);
  assert.throws(() => resolveConfiguration(source, 'typo'), /Unknown configuration/);
});
test('one shared edit appears in both views; a scoped edit stays in its view', () => {
  const record = button();
  record.decisions.find(item => item.id === 'element').answer = 'Updated shared element decision.';
  record.decisions.find(item => item.id === 'primary-focus-color').answer = 'Primary-only update.';
  for (const id of ['primary', 'secondary']) assert.ok(markdown(record, id).includes('Updated shared element decision.'));
  assert.ok(markdown(record, 'primary').includes('Primary-only update.'));
  assert.ok(!markdown(record, 'secondary').includes('Primary-only update.'));
});
test('state and color mode combinations are explicitly selected, never inferred from labels', () => {
  const record = button();
  const disabled = resolveConfiguration(record, 'primary-disabled');
  assert.ok(disabled.decisions.some(item => item.id === 'disabled'));
  assert.ok(!disabled.decisions.some(item => item.id === 'focus-indicator'));
  const forced = resolveConfiguration(record, 'secondary-forced-colors');
  assert.ok(forced.decisions.some(item => item.id === 'focus-indicator'));
  assert.ok(forced.decisions.some(item => item.id === 'forced-colors'));
  assert.ok(!forced.decisions.some(item => item.id === 'secondary-focus-color'));
  record.configurations.find(item => item.id === 'secondary').context = { variant: 'arbitrary-label' };
  assert.ok(resolveConfiguration(record, 'secondary').decisions.some(item => item.id === 'secondary-focus-color'));
});
test('responsibilities, limitations, and checks are filtered alongside decisions', () => {
  const record = button(); record.responsibilities[0].appliesTo = ['primary'];
  const selected = resolveConfiguration(record, 'secondary');
  assert.equal(selected.responsibilities.length, 0);
  assert.ok(selected.limitations.some(item => item.id === 'fixture-only'));
  assert.ok(selected.limitations.some(item => item.id === 'secondary-palette'));
  assert.ok(!selected.checks.some(item => item.id === 'primary-contrast-check'));
  for (const check of selected.checks) for (const id of check.decisions) assert.ok(selected.decisions.some(item => item.id === id));
});
test('rendering shows all scopes by default and preserves shared origins and open items in a selected view', () => {
  const record = button(); const full = markdown(record);
  assert.ok(full.includes('primary-contrast'));
  assert.ok(full.includes('secondary-contrast'));
  assert.ok(full.includes('Applies to: primary.'));
  const selected = markdown(record, 'secondary');
  assert.ok(selected.includes('Applies to: all documented configurations.'));
  assert.ok(selected.includes('**open**'));
  assert.ok(!selected.includes('id="decision-primary-contrast"'));
  assert.ok(selected.includes('id="decision-secondary-contrast"'));
  assert.equal(`${selected}\n`, readFileSync(resolve(ROOT, 'examples/button-secondary.accessibility.md'), 'utf8'));
});
test('invalid items cannot be hidden by selecting another configuration', () => {
  const record = button(); record.decisions.find(item => item.id === 'primary-contrast').status = 'decided';
  assert.throws(() => resolveConfiguration(record, 'secondary'), /answer/);
  assert.throws(() => markdown(record, 'secondary'), /answer/);
});
test('results require one declared configuration and an applicable check', () => {
  const fieldnote = button(); const result = buttonResults();
  assert.deepEqual(validateResults(result, fieldnote), []);
  delete result.results[0].configuration;
  assert.ok(validateResults(result, fieldnote).some(error => error.includes('configuration is required')));
  result.results[0].configuration = 'missing';
  assert.ok(validateResults(result, fieldnote).some(error => error.includes('unknown configuration')));
  result.results[0].configuration = 'secondary'; result.results[0].check = 'primary-contrast-check';
  assert.ok(validateResults(result, fieldnote).some(error => error.includes('does not apply to secondary')));
  result.results[0].check = 'nonexistent';
  assert.ok(validateResults(result, fieldnote).some(error => error.includes('unknown check')));
  result.results[0].configuration = ['primary', 'secondary'];
  assert.ok(validateResults(result, fieldnote).length);
});
test('a primary observation never expands to other configurations', () => {
  const result = buttonResults(); result.results[0].outcome = 'passed';
  const before = structuredClone(result);
  const record = button();
  record.configurations.push({ id: 'third', name: 'Future variant' });
  assert.deepEqual(validateResults(result, record), []);
  assert.deepEqual(result, before);
  assert.deepEqual(result.results.map(item => item.configuration), ['primary']);
});
test('results for flat records reject invented configuration coverage', () => {
  const record = fresh();
  const result = { ...buttonResults(), results: [{ ...buttonResults().results[0], check: record.checks[0].id }] };
  assert.ok(validateResults(result, record).some(error => error.includes('has no configurations')));
  delete result.results[0].configuration;
  assert.deepEqual(validateResults(result, record), []);
});
test('CLI resolves valid JSON, renders selection, and checks result links relative to the result file', () => {
  const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
  const cli = (...args) => {
    const run = spawnSync(process.execPath, [resolve(ROOT, 'tools/fieldnote.mjs'), ...args], { cwd: tmpdir(), encoding: 'utf8', env });
    assert.ifError(run.error); return run;
  };
  const file = resolve(ROOT, 'examples/button.fieldnote.yaml');
  const output = cli('resolve', file, '--configuration', 'secondary');
  assert.equal(output.status, 0, output.stderr);
  assert.deepEqual(validate(JSON.parse(output.stdout)), []);
  assert.equal(cli('resolve', file).status, 2);
  assert.equal(cli('resolve', file, '--configuration', 'missing').status, 1);
  assert.equal(cli('render', file, '--configuration', 'secondary').status, 0);
  assert.equal(cli('validate', file, '--configuration', 'primary').status, 2);
  assert.equal(cli('validate', '--results', resolve(ROOT, 'examples/button.results.json')).status, 0);
  const dir = mkdtempSync(join(tmpdir(), 'afs-results-'));
  try {
    const result = buttonResults(); result.fieldnote = 'missing.yaml';
    const path = join(dir, 'result.json'); writeFileSync(path, JSON.stringify(result));
    assert.equal(cli('validate', '--results', path).status, 1);
    result.fieldnote = file; result.results[0].check = 'missing'; writeFileSync(path, JSON.stringify(result));
    assert.equal(cli('validate', '--results', path).status, 1);
    result.fieldnote = 'https://example.org/fieldnote.yaml'; writeFileSync(path, JSON.stringify(result));
    const remote = cli('validate', '--results', path);
    assert.equal(remote.status, 1); assert.ok(remote.stderr.includes('does not fetch URLs'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
