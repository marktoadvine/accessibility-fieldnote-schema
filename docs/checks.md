# Repository checks

These IDs identify checks on AFS itself. They do not assert accessibility conformance of components described by fieldnotes.

## AFS-01 — Schema, examples, and export integrity

One CI job groups:

- Current-version validation: accepts 0.1.2 and rejects records that need migration.
- Schema constraints: required answers/reasons, duplicate IDs, and decision references.
- Verification-result structure, including revision and environment.
- Documentation rendering that preserves open questions.
- YAML/JSON example equivalence and schema validation of all shipped records, including the base template.

Run the same checks locally:

```sh
npm test
node tools/fieldnote.mjs validate examples/*.fieldnote.yaml examples/*.fieldnote.json examples/base/*.fieldnote.yaml
```

Future independent check groups receive new IDs (AFS-02, AFS-03, …). Keep AFS-01 stable so contributors and branch protection can identify it.

Node.js is used for these repository checks, not required for adopting the fieldnote format.
