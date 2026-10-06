import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validators = Object.fromEntries(['fieldnote', 'results'].map(name => {
  const schema = JSON.parse(readFileSync(resolve(ROOT, 'schema', `${name}.schema.json`), 'utf8'));
  return [name, { version: schema.properties.schemaVersion.const, check: ajv.compile(schema) }];
}));

export function load(path) {
  return YAML.parse(readFileSync(path, 'utf8'));
}

export function validate(record, results = false) {
  const { version, check } = validators[results ? 'results' : 'fieldnote'];
  if (record?.schemaVersion !== version) {
    return [`schemaVersion: expected ${version}; migrate the record or use an older AFS checkout`];
  }
  if (!check(record)) return check.errors.map(error => `${error.instancePath || '$'}: ${error.message}`);
  if (results) return [];
  const errors = [];
  for (const key of ['decisions', 'responsibilities', 'limitations', 'checks']) {
    const ids = record[key].map(item => item.id);
    if (new Set(ids).size !== ids.length) errors.push(`${key}: duplicate IDs`);
  }
  const ids = new Set(record.decisions.map(item => item.id));
  for (const check of record.checks) {
    for (const decision of check.decisions) {
      if (!ids.has(decision)) errors.push(`checks/${check.id}: unknown decision ${decision}`);
    }
  }
  return errors;
}

export function markdown(record) {
  const lines = [
    `# ${record.component.name} — accessibility`, '',
    `Platform: ${record.component.platform}. Component version: ${record.component.version ?? 'unspecified'}.`, '',
    'This record describes intended behavior. Check definitions are not verification results.', '',
    '## Decisions', ''
  ];
  for (const decision of record.decisions) {
    lines.push(`### ${decision.question ?? decision.id}`, '', `Status: **${decision.status}**`, '',
      decision.answer ?? decision.reason ?? 'Unresolved.', '');
    if (decision.answer && decision.reason) lines.push(`Reason: ${decision.reason}`, '');
    for (const source of decision.references ?? []) {
      lines.push(`Source: [${source.standard} ${source.version} ${source.criterion ?? ''}](${source.url})`, '');
    }
  }
  for (const [title, key] of [['Responsibilities', 'responsibilities'], ['Known limitations', 'limitations'], ['Check definitions', 'checks']]) {
    lines.push(`## ${title}`, '');
    if (!record[key].length) lines.push('None recorded.', '');
    for (const item of record[key]) {
      lines.push(`- **${item.id}**${item.owner ? ` (${item.owner})` : ''}: ${item.requirement ?? item.description ?? item.procedure ?? ''}`);
      if ('workaround' in item) lines.push(`  Workaround: ${item.workaround}`);
      if ('method' in item) lines.push(`  Method: ${item.method}; decisions: ${item.decisions.join(', ')}.`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function main(args = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs({ args, options: { results: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } }, allowPositionals: true });
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const [command, ...files] = options.positionals;
  if (options.values.help) {
    console.log('Usage: node tools/fieldnote.mjs validate|render [--results] FILE...');
    return 0;
  }
  if (!['validate', 'render'].includes(command) || !files.length || (command === 'render' && options.values.results)) {
    console.error('Usage: node tools/fieldnote.mjs validate|render [--results] FILE...\nResult rendering is not supported.');
    return 2;
  }
  let failed = false;
  for (const file of files) {
    try {
      const record = load(file);
      const errors = validate(record, options.values.results);
      if (errors.length) throw new Error(errors.join('\n'));
      console.log(command === 'render' ? markdown(record) : `${file}: valid`);
    } catch (error) {
      console.error(`${file}: ${error.message}`);
      failed = true;
    }
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main();
}
