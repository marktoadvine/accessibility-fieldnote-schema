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

Replace the final path with your own file. YAML and JSON are both accepted.
The CLI checks `schemaVersion` against the current local schema; it does not fetch the
record's `$schema` URL. It exits with status 0 on success, 1 for invalid records or unreadable files, and 2 for invalid command usage,
so the same command can run in your documentation build or CI.

For example, a `decided` entry without an `answer` fails validation:

```yaml
decisions:
  - id: removal-feedback
    topic: state
    status: decided
```

Add an `answer`, or leave the status `open` while the decision is unresolved.
Questions and guidance packs are optional in 0.2.0. Custom component behavior
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
references point to existing entries and stay within configuration scope. Neither verifies accessibility behavior,
source accuracy, or WCAG conformance.

## Configurations and results

Validate the complete record before rendering a selected view:

```sh
node tools/fieldnote.mjs validate examples/button.fieldnote.yaml
node tools/fieldnote.mjs render examples/button.fieldnote.yaml --configuration secondary
node tools/fieldnote.mjs resolve examples/button.fieldnote.yaml --configuration secondary
node tools/fieldnote.mjs validate --results examples/button.results.json
```

Results validation reads the linked local fieldnote and verifies check IDs and
configuration scope. It accepts no URL fetches. See [configuration rules](configurations.md)
and [migration](migration.md). A valid result is not proof that a check ran.

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
