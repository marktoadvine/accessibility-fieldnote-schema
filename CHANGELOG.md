# Changelog

## 0.1.1 — working branch

- Questions are optional: decisions can describe intended component behavior directly.
- Guidance packs are optional, independently versioned authoring aids; the web dialog pack is explicitly experimental and carries scope, provenance, and a review date.
- The worksheet uses a generated copy of the canonical pack and exports source references with decisions.
- The validator supports 0.1.0 and 0.1.1; documentation rendering handles records without questions.
- Added a custom-component example and guidance/migration documentation.
- Fixed headline spacing on mobile. Browser checks cover decision status, YAML download, draft persistence, and mobile overflow.
- Preserved the 0.1.0 schemas unchanged. AFS-01 includes version compatibility and guidance-pack synchronization checks.

This is a draft change to the record format, not an updated accessibility standard or a conformance assessment.

## 0.1.0

- Introduced versioned fieldnote and results schemas, with separate design intent and verification evidence.
- Added a modal-dialog worksheet with YAML, JSON, and Markdown exports and local draft storage.
- Added a barebones starter record and a documented dialog example.
- Added optional Python validation and documentation rendering tools.
- Named the initial CI check AFS-01: schema, examples, and export integrity.
