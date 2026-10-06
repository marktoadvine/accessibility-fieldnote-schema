# Start your own fieldnote

Copy [component.fieldnote.yaml](component.fieldnote.yaml) into your design system documentation. Rename it, for example, `button.fieldnote.yaml`. Set `component.id` and `component.name`. Keep the schema URL and version.

This is the smallest valid record. Empty lists mean nothing is recorded yet. No tooling is required to author it.

Replace `decisions: []` with a question relevant to your component:

```yaml
decisions:
  - id: accessible-name
    topic: semantics
    question: What gives this component its accessible name?
    status: open
```

Once you have made the decision:

```yaml
decisions:
  - id: accessible-name
    topic: semantics
    question: What gives this component its accessible name?
    status: decided
    answer: The button's visible text provides its accessible name.
```

That documents intent; it does not claim the implementation was tested. Use `not-applicable` with a `reason` when a question does not apply.

Add `responsibilities`, `limitations`, and `checks` when needed. Keep their empty lists until then. The [dialog example](../dialogue.fieldnote.yaml) shows a fuller record.

Link the file from your component page, or render it with your existing documentation tooling. Continue editing this same record after implementation. Keep decision IDs stable and record known limitations rather than removing unresolved questions at release.
