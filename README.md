# Accessibility Fieldnote Schema

Living accessibility decisions for components. A small, versioned sidecar that starts during design and ships with component documentation.

**Draft 0.1.1 · web components · experimental.** This records expectations and responsibilities; it does not certify accessibility or WCAG conformance.

## Start with one file — no installation

Copy [the smallest valid fieldnote](examples/base/component.fieldnote.yaml), rename it to `your-component.fieldnote.yaml`, and place it beside your component documentation. Change the component ID and name, then add decisions as you work. No installation is required to write or share the file.

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/schema/fieldnote.schema.json
schemaVersion: "0.1.1"
component:
  id: my-component
  name: My component
  platform: web
decisions: []
responsibilities: []
limitations: []
checks: []
```

Empty lists are valid placeholders, not completed accessibility work. Start with one question:

```yaml
decisions:
  - id: accessible-name
    topic: semantics
    question: What gives this component its accessible name?
    status: open
```

When decided, change `status` to `decided` and add an `answer`. Use `not-applicable` with a `reason` when the question does not apply. See [the base guide](examples/base/README.md) and [a fuller dialog example](examples/dialogue.fieldnote.yaml).

## Carry it into your design system docs

Keep the fieldnote as the source of truth. Link it from the component page for an immediate, portable handoff. To show its contents inline, your documentation system can parse the YAML (or equivalent JSON) and render decisions, responsibilities, limitations, and checks. Any language or documentation stack can implement this; AFS is the data format, not a JavaScript dependency.

Retain stable decision IDs as the component changes. Add the implementation version when available; keep unresolved questions and limitations visible after release. Check definitions describe how to verify behavior, not whether it has passed.

The optional renderer below generates Markdown for documentation systems that accept it. Generate that page during your docs build rather than maintaining a second copy by hand.

## Validate your own entries

See [validation instructions](docs/validation.md) for files in another repository and local editor validation. A hosted service or published package is not required. Remote schema URLs need public access; use local schema files while this repository is private.

## Optional tools

### Validation and Markdown generation

The included reference CLI uses Node.js 22+. Install its dependencies only if you want to run it:

```sh
npm ci
node tools/fieldnote.mjs validate examples/base/component.fieldnote.yaml
node tools/fieldnote.mjs render examples/dialogue.fieldnote.yaml > dialogue.accessibility.md
```

An editor or another validator supporting JSON Schema Draft 2020-12 can use the `$schema` URL for structural checks. The reference CLI additionally checks duplicate IDs and dangling decision references.

## The model

| Field | Purpose |
| --- | --- |
| `component` | Identity, platform, optional implementation version and design/source links |
| `guidance` | Optional profile ID and the version used to author the decisions |
| `decisions` | Stable IDs, topics, optional questions, status, answers, rationale, and optional versioned source references |
| `responsibilities` | What designers, implementers, or consumers must supply |
| `limitations` | Known limitations and optional workarounds |
| `checks` | Procedures and test references linked to decision IDs |

`open` is a valid state. `decided` requires an answer; `not-applicable` requires a reason. The CLI also rejects duplicate IDs and dangling decision references. Schema validity does not establish that the guidance, implementation, or answers are correct.

JSON and YAML represent the same model. UTF-8 files use the `.fieldnote.yaml` or `.fieldnote.json` suffix. Unknown fields are rejected in 0.1.1 to catch mistakes early.

## Separate verification results

[The results schema](schema/results.schema.json) records the fieldnote location, assessed implementation revision, check ID, outcome, observation date, environment, and evidence. Validate it using `node tools/fieldnote.mjs validate --results results.json`.

Result validation currently validates structure; it does not resolve the linked fieldnote or prove the check exists. No sample result is presented as a real assessment. Updating a component never automatically renews old results.

## Guidance and maintenance

**AFS structures records; guidance packs help author them.** Neither questions nor packs are mandatory. Record custom behavior directly with a decision ID, topic, status, and answer; see [the custom component example](examples/custom.fieldnote.yaml) and [guidance/migration documentation](docs/guidance.md).


The optional, experimental web modal-dialog guidance pack draws on the [W3C APG modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). APG guidance and WCAG requirements are distinct. Questions need contextual answers; the pack does not prescribe one initial focus target for every dialog.

Profiles are versioned separately from the schema. Updating guidance must prompt review rather than silently rewriting decisions. Automated profile comparison is a future feature.

Only the current schemas live in `schema/`. The `schemaVersion` field identifies the record format; the CLI validates against the current version only. Older schemas remain in Git history. Use a release tag or commit-pinned URL when you need a fixed version. Draft URLs use the `0.1.1` branch until merge; branch URLs are mutable.

## Scope of this prototype

Portable component records, versioned schemas, examples, and optional validation and Markdown rendering. Next: use the format in real component documentation and refine it from those trials.

## License and contributions

[MIT](LICENSE). See [contribution guidance](CONTRIBUTING.md).
