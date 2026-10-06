# Repository checks

These IDs identify checks on AFS itself. They do not assert accessibility conformance of components described by fieldnotes.

## AFS-01 — Schema, examples, and export integrity

One CI job groups:

- Schema constraints: required answers/reasons, duplicate IDs, and decision references.
- Verification-result structure, including revision and environment.
- Documentation rendering that preserves open questions.
- YAML/JSON example equivalence and schema validation of all shipped records, including the base template.
- Worksheet model behavior and generated YAML validation.

Run the same checks locally:

```sh
python -m unittest discover -s tests -v
python tools/fieldnote.py validate examples/*.fieldnote.yaml examples/*.fieldnote.json examples/base/*.fieldnote.yaml
node tests/model.test.mjs
python tools/fieldnote.py validate /tmp/afs-browser-export.yaml
```

Future independent check groups receive new IDs (AFS-02, AFS-03, …). Keep AFS-01 stable so contributors and branch protection can identify it.

Python and Node are used for these repository checks, not required for adopting the fieldnote format.
