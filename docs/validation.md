# Validate your fieldnote

AFS does not need a package registry or hosted service. Use a local copy of
its schema, an editor with JSON Schema support, or the optional reference CLI.

## Files in another repository

Clone AFS somewhere separate from your design system. Use the current version on `main`:

```sh
git clone https://github.com/marktoadvine/accessibility-fieldnote-schema.git
cd accessibility-fieldnote-schema
npm ci
node tools/fieldnote.mjs validate /absolute/path/to/dialogue.fieldnote.yaml
```

The repository currently requires GitHub access because it is private.
Replace the final path with your own file. YAML and JSON are both accepted.
The CLI checks `schemaVersion` against the current local schema; it does not fetch the
record's `$schema` URL. It exits with status 0 on success and 1 on failure,
so the same command can run in your documentation build or CI.

For example, a `decided` entry without an `answer` fails validation:

```yaml
decisions:
  - id: removal-feedback
    topic: state
    status: decided
```

Add an `answer`, or leave the status `open` while the decision is unresolved.
Questions and guidance packs are optional in 0.1.1. Custom component behavior
uses the same fields; unknown fields are rejected.

## Editor validation

In VS Code with the YAML extension by Red Hat, map fieldnotes to your local
schema in workspace settings. Replace the schema path with your checkout:

```json
{
  "yaml.schemas": {
    "/absolute/path/to/accessibility-fieldnote-schema/schema/fieldnote.schema.json": "**/*.fieldnote.yaml"
  }
}
```

For JSON, supported editors can read `$schema`; use a reachable URL or a
local schema path. A `$schema` entry identifies the schema but does not run
validation on its own. A remote URL in a private repo may fail even when your
Git client is authenticated; use the local mapping in that case.

Generic schema validators check fields, types, and required answers or
reasons. The reference CLI also detects duplicate IDs and checks that decision
references point to existing entries. Neither verifies accessibility behavior,
source accuracy, or WCAG conformance.

## Public distribution

A public repository with reachable schema URLs is sufficient; npm or PyPI
publication is optional. For a release, merge reviewed changes, create a
version tag, and publish a GitHub release with migration notes. Use a release
tag or commit-pinned schema URL for reproducible validation. Branch URLs are
mutable drafts.

The MIT license covers AFS's schemas, documentation, examples, and tooling.
Authoring a fieldnote with AFS does not require licensing your own component
or record under MIT. Referenced standards retain their own licenses.

Only current schemas are stored in `schema/`. To validate an older format, use
a matching Git tag or commit checkout, or migrate the record to the current
`schemaVersion`. There are no per-version schema folders.
