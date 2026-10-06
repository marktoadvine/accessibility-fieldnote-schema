# Accessibility Fieldnote Schema

Living accessibility decisions for components. A small, versioned sidecar that starts during design and ships with component documentation.

**Draft 0.1.0 · web components · experimental.** This records expectations and responsibilities; it does not certify accessibility or WCAG conformance.

## Try the tool

```sh
python -m http.server 8000
```

Open **http://localhost:8000/app/**. Work through seven modal-dialog questions, keep unresolved decisions open, and export YAML, JSON, or Markdown documentation. Drafts are stored locally in your browser when available. No account, AI service, or backend is needed. Import supports the worksheet's JSON exports; use the CLI for other records. YAML import is not included yet.

## Use the file

Keep `dialogue.fieldnote.yaml` beside the component or its documentation. See [the example](examples/dialogue.fieldnote.yaml).

```yaml
$schema: https://raw.githubusercontent.com/marktoadvine/accessibility-fieldnote-schema/main/schema/0.1.0/fieldnote.schema.json
schemaVersion: "0.1.0"
component:
  id: dialogue
  name: Confirmation dialogue
  platform: web
decisions:
  - id: return-focus
    topic: focus
    question: Where does focus return when the trigger disappears?
    status: open
responsibilities: []
limitations: []
checks: []
```

## Validate and publish documentation

Python 3.10+ is required.

```sh
pip install -r requirements.txt
python tools/fieldnote.py validate examples/dialogue.fieldnote.yaml
python tools/fieldnote.py render examples/dialogue.fieldnote.yaml > dialogue.accessibility.md
python -m unittest discover -s tests -v
node tests/model.test.mjs
```

Run the renderer in your documentation build. The YAML is the authored record; Markdown is generated output. A DSDS component can reference the sidecar using its supported reference fields rather than duplicating the decisions. Exact DSDS integration remains to be demonstrated against its validator.

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

One modal-dialog worksheet; portable records for other web components; structural validation; component-doc generation. Next: real design/implementation trials, richer round-trip editing, evidence integration, and verified DSDS interoperability.
