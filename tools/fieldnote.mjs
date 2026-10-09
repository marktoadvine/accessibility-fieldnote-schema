import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const collections = ['decisions', 'responsibilities', 'limitations', 'checks'];
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validators = Object.fromEntries(['fieldnote', 'results'].map(name => {
  const schema = JSON.parse(readFileSync(resolve(ROOT, 'schema', `${name}.schema.json`), 'utf8'));
  return [name, { version: schema.properties.schemaVersion.const, check: ajv.compile(schema) }];
}));

export function load(path) {
  return YAML.parse(readFileSync(path, 'utf8'));
}

const covers = (item, configuration) => !item.appliesTo || item.appliesTo.includes(configuration);

// Schema validation alone cannot resolve IDs or compare check and decision scopes.
export function validate(record, results = false) {
  const { version, check } = validators[results ? 'results' : 'fieldnote'];
  if (record?.schemaVersion !== version) {
    return [`schemaVersion: expected ${version}; migrate the record or use an older AFS checkout`];
  }
  if (!check(record)) return check.errors.map(error => `${error.instancePath || '$'}: ${error.message}`);
  if (results) return [];
  const errors = [];
  const configurations = record.configurations?.map(item => item.id) ?? [];
  for (const key of [...collections, 'configurations']) {
    const ids = (record[key] ?? []).map(item => item.id);
    if (new Set(ids).size !== ids.length) errors.push(`${key}: duplicate IDs`);
  }
  for (const key of collections) {
    for (const item of record[key]) {
      for (const id of item.appliesTo ?? []) {
        if (!configurations.includes(id)) errors.push(`${key}/${item.id}: unknown configuration ${id}`);
      }
    }
  }
  const decisions = new Map(record.decisions.map(item => [item.id, item]));
  for (const check of record.checks) {
    for (const id of check.decisions) {
      const decision = decisions.get(id);
      if (!decision) {
        errors.push(`checks/${check.id}: unknown decision ${id}`);
      } else {
        for (const configuration of check.appliesTo ?? configurations) {
          if (!covers(decision, configuration)) {
            errors.push(`checks/${check.id}: decision ${id} does not apply to ${configuration}`);
          }
        }
      }
    }
  }
  return errors;
}

// Results are observations about one configuration, even when the check is shared.
export function validateResults(record, fieldnote) {
  const errors = validate(record, true);
  const fieldnoteErrors = validate(fieldnote);
  if (errors.length || fieldnoteErrors.length) return [...errors, ...fieldnoteErrors.map(error => `fieldnote: ${error}`)];
  const configurations = new Set((fieldnote.configurations ?? []).map(item => item.id));
  const checks = new Map(fieldnote.checks.map(item => [item.id, item]));
  for (const [index, observation] of record.results.entries()) {
    const path = `results/${index}`;
    const check = checks.get(observation.check);
    if (!check) errors.push(`${path}: unknown check ${observation.check}`);
    if (configurations.size) {
      if (!observation.configuration) {
        errors.push(`${path}: configuration is required for this fieldnote`);
      } else if (!configurations.has(observation.configuration)) {
        errors.push(`${path}: unknown configuration ${observation.configuration}`);
      } else if (check && !covers(check, observation.configuration)) {
        errors.push(`${path}: check ${check.id} does not apply to ${observation.configuration}`);
      }
    } else if (observation.configuration) {
      errors.push(`${path}: fieldnote has no configurations`);
    }
  }
  return errors;
}

export function resolveConfiguration(record, configuration) {
  const errors = validate(record);
  if (errors.length) throw new Error(errors.join('\n'));
  const selected = record.configurations?.find(item => item.id === configuration);
  if (!selected) throw new Error(`Unknown configuration: ${configuration}`);
  const resolved = structuredClone(record);
  resolved.configurations = [structuredClone(selected)];
  for (const key of collections) {
    resolved[key] = resolved[key].filter(item => covers(item, configuration)).map(item => {
      if (item.appliesTo) item.appliesTo = [configuration];
      return item;
    });
  }
  return resolved;
}

function scopeLine(item, record) {
  if (!record.configurations) return [];
  return [`Applies to: ${item.appliesTo?.join(', ') ?? 'all documented configurations'}.`, ''];
}

export function markdown(record, configuration) {
  const errors = validate(record);
  if (errors.length) throw new Error(errors.join('\n'));
  const selected = configuration ? resolveConfiguration(record, configuration) : record;
  const lines = [
    `# ${record.component.name} — accessibility`, '',
    `Platform: ${record.component.platform}. Component version: ${record.component.version ?? 'unspecified'}.`, '',
    'This record describes intended behavior. Check definitions are not verification results.', '',
  ];
  if (record.configurations) {
    lines.push(configuration ? `Configuration: **${configuration}**.` : '## Configurations', '');
    for (const item of selected.configurations) {
      const context = Object.entries(item.context ?? {}).map(([key, value]) => `${key}=${value}`).join(', ');
      lines.push(`- **${item.id}** — ${item.name}${context ? ` (${context})` : ''}`);
    }
    lines.push('', configuration
      ? 'This view covers only the selected configuration. Other configurations may be documented in the source fieldnote.'
      : 'Only the configurations listed here are documented; other combinations are unspecified.', '');
  }
  if (record.benchmarks?.length) {
    lines.push('## Benchmarks', '', 'Sources informing decisions; not a conformance claim.', '');
    for (const source of record.benchmarks) lines.push(`- [${source.name} ${source.version}](${source.url})`);
    lines.push('');
  }
  lines.push('## Decisions', '');
  for (const decision of selected.decisions) {
    lines.push(`<a id="decision-${decision.id}"></a>`, '', `### ${decision.question ?? decision.id}`, '');
    // Use original scope even in a selected view so readers can see which rules are shared.
    const original = record.decisions.find(item => item.id === decision.id);
    lines.push(...scopeLine(original, record), `Status: **${decision.status}**`, '',
      decision.answer ?? decision.reason ?? 'Unresolved.', '');
    if (decision.answer && decision.reason) lines.push(`Reason: ${decision.reason}`, '');
    for (const source of decision.references ?? []) {
      lines.push(`Source: [${source.standard} ${source.version} ${source.criterion ?? ''}](${source.url})`, '');
    }
  }
  for (const [title, key] of [['Responsibilities', 'responsibilities'], ['Known limitations', 'limitations'], ['Check definitions', 'checks']]) {
    lines.push(`## ${title}`, '');
    if (!selected[key].length) lines.push('None recorded.', '');
    for (const item of selected[key]) {
      lines.push(`- **${item.id}**${item.owner ? ` (${item.owner})` : ''}: ${item.requirement ?? item.description ?? item.procedure ?? ''}`);
      const original = record[key].find(entry => entry.id === item.id);
      const scope = scopeLine(original, record);
      if (scope.length) lines.push(`  ${scope[0]}`);
      if ('workaround' in item) lines.push(`  Workaround: ${item.workaround}`);
      if ('method' in item) lines.push(`  Method: ${item.method}; decisions: ${item.decisions.join(', ')}.`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function validateResultFile(record, file) {
  const errors = validate(record, true);
  if (errors.length) return errors;
  if ((!isAbsolute(record.fieldnote) && /^[a-z][a-z0-9+.-]*:/i.test(record.fieldnote)) || /[?#]/.test(record.fieldnote)) {
    return ['fieldnote: use a local file path; the CLI does not fetch URLs or resolve fragments'];
  }
  return validateResults(record, load(resolve(dirname(file), record.fieldnote)));
}

const usage = 'Usage: node tools/fieldnote.mjs validate|render|resolve FILE... [--configuration ID] [--results]';
export function main(args = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs({ args, options: {
      results: { type: 'boolean' }, configuration: { type: 'string' }, help: { type: 'boolean', short: 'h' }
    }, allowPositionals: true });
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const [command, ...files] = options.positionals;
  const { results, configuration } = options.values;
  if (options.values.help) {
    console.log(usage);
    return 0;
  }
  if (!['validate', 'render', 'resolve'].includes(command) || !files.length ||
      (results && command !== 'validate') ||
      (configuration !== undefined && (command === 'validate' || !configuration)) ||
      (command === 'resolve' && (!configuration || files.length !== 1))) {
    console.error(`${usage}\nUse --results only with validate. Resolve requires one file and a configuration.`);
    return 2;
  }
  let failed = false;
  for (const file of files) {
    try {
      const record = load(file);
      const errors = results ? validateResultFile(record, file) : validate(record);
      if (errors.length) throw new Error(errors.join('\n'));
      if (command === 'render') console.log(markdown(record, configuration));
      else if (command === 'resolve') console.log(JSON.stringify(resolveConfiguration(record, configuration), null, 2));
      else console.log(`${file}: valid`);
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
