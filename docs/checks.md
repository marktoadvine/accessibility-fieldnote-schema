# Repository checks

These IDs identify checks on AFS itself. They do not assert accessibility conformance of components described by fieldnotes.

## AFS-01 — Schema, examples, and export integrity

One CI job groups:

- Current-version validation: accepts 0.2.0 and rejects records that need migration.
- Schema constraints: required answers/reasons, duplicate IDs, and decision references.
- Configuration IDs, scope membership, additive selection, and check/decision scope compatibility.
- Verification-result structure and linked check/configuration validation, including observations that cannot expand to other configurations.
- Complete and selected documentation rendering that preserves shared decisions, scope labels, and open questions.
- YAML/JSON example equivalence and schema validation of all shipped records, including the base template.

Run the same checks locally:

```sh
npm ci
npm run check
```

Future independent check groups receive new IDs (AFS-02, AFS-03, …). Keep AFS-01 stable so contributors and branch protection can identify it.

Node.js is used for these repository checks, not required for adopting the fieldnote format.
