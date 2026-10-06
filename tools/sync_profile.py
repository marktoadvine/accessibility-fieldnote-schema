"""Generate the browser's guidance pack module from the canonical JSON pack."""
import argparse, json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    pack=json.loads((ROOT/'profiles/dialog-modal.json').read_text())
    content='// Generated from profiles/dialog-modal.json; run tools/sync_profile.py.\nexport default '+json.dumps(pack,indent=2)+';\n'
    target=ROOT/'app/dialog-modal.js'
    if args.check:
        if target.read_text()!=content:
            print('Guidance pack module is stale. Run python tools/sync_profile.py.',file=sys.stderr)
            return 1
        print('Guidance pack module matches canonical JSON')
    else: target.write_text(content)
    return 0
if __name__=='__main__':sys.exit(main())
