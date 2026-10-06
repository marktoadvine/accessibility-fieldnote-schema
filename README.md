# Accessibility Fieldnote Schema

Living accessibility decisions for components. A small, versioned sidecar that starts during design and ships with component documentation.

**Draft 0.1.0 · web components · experimental.** This records expectations and responsibilities; it does not certify accessibility or WCAG conformance.

## Start with one file — no installation

Copy [the smallest valid fieldnote](examples/base/component.fieldnote.yaml), rename it to `your-component.fieldnote.yaml`, and place it beside your component documentation. Change the component ID and name, then add decisions as you work. No Python, Node, account, or authoring app is required to write or share the file.

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/0.1.0/fieldnote.schema.json
schemaVersion: "0.1.0"
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

Keep the fieldnote as the source of truth. Link it from the component page for an immediate, portable handoff. To show its contents inline, your documentation system can parse the YAML (or equivalent JSON) and render decisions, responsibilities, limitations, and checks. Any language or documentation stack can implement this; AFS is the data format, not a Python dependency.

Retain stable decision IDs as the component changes. Add the implementation version when available; keep unresolved questions and limitations visible after release. Check definitions describe how to verify behavior, not whether it has passed.

The optional renderer below generates Markdown for documentation systems that accept it. Generate that page during your docs build rather than maintaining a second copy by hand.

## Optional tools

### Guided authoring

Serve this repository with any static web server and open `/app/`. For example, if Python is already installed:

```sh
python -m http.server 8000
```

Open **http://localhost:8000/app/**. The modal-dialog worksheet exports YAML, JSON, and Markdown. Drafts stay in your browser when storage is available. Import supports the worksheet's JSON exports; other fieldnotes can be edited directly. YAML import is not included yet.

### Validation and Markdown generation

The included reference CLI uses Python 3.10+. Install its dependencies only if you want to run it:

```sh
pip install -r requirements.txt
python tools/fieldnote.py validate examples/base/component.fieldnote.yaml
python tools/fieldnote.py render examples/dialogue.fieldnote.yaml > dialogue.accessibility.md
```

An editor or another validator supporting JSON Schema Draft 2020-12 can use the `$schema` URL for structural checks. The reference CLI additionally checks duplicate IDs and dangling decision references.

## The model

| Field | Purpose |
| --- | --- |
| `component` | Identity, platform, optional implementation version and design/source links |
| `guidance` | Optional profile ID and the version used to author the decisions |
| `decisions` | Stable IDs, topics, questions, status, answers, rationale, and optional versioned source references |
| `responsibilities` | What designers, implementers, or consumers must supply |
| `limitations` | Known limitations and optional workarounds |
| `checks` | Procedures and test references linked to decision IDs |

`open` is a valid state. `decided` requires an answer; `not-applicable` requires a reason. The CLI also rejects duplicate IDs and dangling decision references. Schema validity does not establish that the guidance, implementation, or answers are correct.

JSON and YAML represent the same model. UTF-8 files use the `.fieldnote.yaml` or `.fieldnote.json` suffix. Unknown fields are rejected in 0.1.0 to catch mistakes early.

## Separate verification results

[The results schema](schema/0.1.0/results.schema.json) records the fieldnote location, assessed implementation revision, check ID, outcome, observation date, environment, and evidence. Validate it using `python tools/fieldnote.py validate --results results.json`.

Result validation currently validates structure; it does not resolve the linked fieldnote or prove the check exists. No sample result is presented as a real assessment. Updating a component never automatically renews old results.

## Guidance and maintenance

The first profile draws on the [W3C APG modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). APG guidance and WCAG requirements are distinct. Questions need contextual answers; the tool does not prescribe one initial focus target for every dialog.

Profiles are versioned separately from the schema. Updating guidance must prompt review rather than silently rewriting decisions. Automated profile comparison is a future feature.

Schemas are versioned under `schema/0.1.0/`. Once released, that directory must remain unchanged; incompatible changes require a new version. The current URL uses `main` because no release tag exists yet. Release tags can provide immutable retrieval URLs later.

## Scope of this prototype

One modal-dialog worksheet; portable records for other web components; structural validation; component-doc generation. Next: real design/implementation trials, richer round-trip editing, evidence integration, and verified interoperability with design system documentation.
