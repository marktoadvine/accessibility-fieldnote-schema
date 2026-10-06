# Changelog

## Unreleased

- Point schema URLs and setup instructions to `main` after merging 0.1.1.

## 0.1.1

- Replaced Python tooling and tests with JavaScript, Node.js CI, and a dependency lockfile.

- Added an MIT license, contribution guidance, and external-file/editor validation instructions.

- Removed the authoring app, browser tests, generated guidance module, and Node CI setup. Fieldnotes are authored directly in YAML or JSON.
- Questions are optional: decisions can describe intended component behavior directly.
- Guidance packs are optional, independently versioned authoring aids; the web dialog pack is explicitly experimental and carries scope, provenance, and a review date.
- The validator checks the current schema version; documentation rendering handles records without questions.
- Added a custom-component example and guidance/migration documentation.
- Keep only current schemas in `schema/`; older formats remain in Git history. AFS-01 checks schemas, examples, current-version validation, and documentation rendering.

This is a draft change to the record format, not an updated accessibility standard or a conformance assessment.

## 0.1.0

- Introduced versioned fieldnote and results schemas, with separate design intent and verification evidence.
- Added a modal-dialog worksheet with YAML, JSON, and Markdown exports and local draft storage.
- Added a barebones starter record and a documented dialog example.
- Added optional Python validation and documentation rendering tools.
- Named the initial CI check AFS-01: schema, examples, and export integrity.
