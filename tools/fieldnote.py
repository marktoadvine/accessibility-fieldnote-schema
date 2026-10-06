"""Validate fieldnotes and generate component documentation."""
import argparse, json, pathlib, sys
import yaml
from jsonschema import Draft202012Validator, FormatChecker
ROOT = pathlib.Path(__file__).resolve().parents[1]
def load(path):
    return yaml.safe_load(pathlib.Path(path).read_text())
def validate(record, results=False):
    version = record.get('schemaVersion') if isinstance(record, dict) else None
    if version not in {'0.1.0', '0.1.1'}:
        return ['schemaVersion: expected 0.1.0 or 0.1.1']
    schema = json.loads((ROOT / 'schema' / version / ('results.schema.json' if results else 'fieldnote.schema.json')).read_text())
    errors = [f'{"/".join(map(str,e.absolute_path)) or "$"}: {e.message}' for e in Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(record)]
    if errors or results: return errors
    for key in ['decisions','responsibilities','limitations','checks']:
        ids = [x['id'] for x in record[key]]
        if len(ids) != len(set(ids)): errors.append(f'{key}: duplicate IDs')
    ids = {x['id'] for x in record['decisions']}
    for check in record['checks']:
        for decision in check['decisions']:
            if decision not in ids: errors.append(f"checks/{check['id']}: unknown decision {decision}")
    return errors

def markdown(record):
    lines = [f"# {record['component']['name']} — accessibility", '', f"Platform: {record['component']['platform']}. Component version: {record['component'].get('version','unspecified')}.", '', 'This record describes intended behavior. Check definitions are not verification results.', '', '## Decisions', '']
    for d in record['decisions']:
        lines.extend([f"### {d.get('question', d['id'])}", '', f"Status: **{d['status']}**", '', d.get('answer',d.get('reason','Unresolved.')), ''])
        if d.get('answer') and d.get('reason'): lines.extend([f"Reason: {d['reason']}", ''])
        for r in d.get('references',[]): lines.extend([f"Source: [{r['standard']} {r['version']} {r.get('criterion','')}]({r['url']})", ''])
    for title,key in [('Responsibilities','responsibilities'),('Known limitations','limitations'),('Check definitions','checks')]:
        lines.extend([f'## {title}', ''])
        if not record[key]: lines.extend(['None recorded.', ''])
        for item in record[key]:
            value = item.get('requirement',item.get('description',item.get('procedure','')))
            lines.extend([f"- **{item['id']}**" + (f" ({item['owner']})" if 'owner' in item else '') + ': ' + value])
            if 'workaround' in item: lines.append(f"  Workaround: {item['workaround']}")
            if 'method' in item: lines.append(f"  Method: {item['method']}; decisions: {', '.join(item['decisions'])}.")
        lines.append('')
    return '\n'.join(lines)
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['validate','render'])
    parser.add_argument('files',nargs='+')
    parser.add_argument('--results',action='store_true',help='Validate verification result files')
    args=parser.parse_args()
    if args.results and args.command=='render': parser.error('Result rendering is not supported')
    failed=False
    for file in args.files:
        try:
            record=load(file); errors=validate(record,args.results)
            if errors: raise ValueError('\n'.join(errors))
            if args.command=='render': print(markdown(record))
            else: print(f'{file}: valid')
        except (OSError,ValueError,yaml.YAMLError) as e:
            print(f'{file}: {e}',file=sys.stderr); failed=True
    return int(failed)
if __name__=='__main__': sys.exit(main())
