# Records and guidance are separate

AFS defines the structure of a component's accessibility record. It does not define a universal questionnaire, prescribe an implementation, or establish a complete set of accessibility requirements.

## Record behavior directly

In 0.1.1, `question` is optional. A custom component can record a decision without selecting a profile:

```yaml
decisions:
  - id: removal-feedback
    topic: state
    status: decided
    answer: Announce which filter was removed without moving focus to the message.
```

An open decision may use its stable ID to identify the unresolved subject, with or without a question. A decided item requires an answer; a not-applicable item requires a reason. See [the custom example](../examples/custom.fieldnote.yaml).

## Optional guidance packs

Packs supply authoring prompts scoped to a platform and interaction. They are separate from the core schema and version independently. A team can write a fieldnote without any pack, bring its own guidance, or extend prompts for its particular component.

The [experimental modal-dialog pack](../profiles/dialog-modal.json) declares its platform, pack version, sources, and review date. Its date describes review of the pack; it is not the publication date of a standard. Its source is a living APG page, not a versioned WCAG requirement catalogue. The prompts are author-written interpretations and are neither exhaustive nor native-app guidance.

Use the pack as an optional reference while editing a fieldnote. The top-level `guidance` field records pack identity/version; per-decision `references` can record the sources relevant to that particular expectation. Do not attach a source that does not support the decision.

## When guidance changes

Preserve existing decisions, source versions, and test evidence. Review affected decisions against the updated source and document any changes explicitly. Do not silently replace answers or refresh verification results. Automated review flags are not implemented yet and cannot prove an answer is still correct.

WCAG requirements, platform documentation, and APG pattern guidance have different authority and scope. Document that distinction when writing a pack or source reference. The current reference implementation only includes a web modal-dialog pack.

## Pack maintenance

Edit `profiles/dialog-modal.json` directly. Update its version and review date when its prompts or sources change. Existing fieldnotes retain the pack version used to author them.

## Updating an older record

See [migration to 0.2.0](migration.md). Schema versions, benchmarks, and guidance-pack versions are independent. Keep existing sources and evidence intact; a format migration does not review decisions against new guidance.
