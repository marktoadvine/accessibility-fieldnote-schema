# Configurations

A fieldnote can document one component across variants, states, themes, or other
conditions. `configurations` and `appliesTo` are optional. A simple component
still uses the base template.

## Write the shared part once

```yaml
configurations:
  - id: primary
    name: Primary
    context: { variant: primary, state: enabled }
  - id: secondary
    name: Secondary
    context: { variant: secondary, state: enabled }
decisions:
  - id: accessible-name
    topic: semantics
    status: decided
    answer: The visible label supplies the accessible name.
  - id: secondary-contrast
    topic: visual
    status: open
    question: What are the measured text/background contrast ratios?
    appliesTo: [secondary]
```

The first decision is shared. The second belongs only to `secondary`.
The [button example](../examples/button.fieldnote.yaml) includes primary and
secondary configurations, disabled states, and forced colors. It is an
illustrative fixture, not an implemented or assessed component.

## Selection rules

These rules define the format independently of the reference CLI:

1. Each configuration has a unique `id` and a `name`. Optional `context` is a
   map of descriptive strings. Its keys and values do not drive selection.
2. Decisions, responsibilities, limitations, and checks may carry `appliesTo`:
   a nonempty list of unique, declared configuration IDs.
3. Omitted `appliesTo` means all configurations documented in this record.
   With no `configurations`, the item applies to the component as before.
4. For a selected configuration, retain every item with omitted `appliesTo`
   or whose list includes that ID. Preserve order and IDs.
5. Matching items are additive. There is no override, precedence, text merge,
   implicit default, or inheritance between files. Contradictory prose needs
   human review; schema validation cannot detect it.
6. IDs are unique within each collection across all configurations. A check's
   scope must be contained in the scope of **every** decision it references.
   A shared check can reference only shared decisions or decisions explicitly
   covering all documented configurations.

The reference resolver returns a new valid fieldnote containing only the
selected configuration and matching items. Explicit scopes become a one-item
list containing that configuration; omitted scopes remain omitted. It never
modifies the source. Treat the result as a generated view, not another source
to maintain.

Configuration IDs describe specific situations. There is no automatic Cartesian
product: `primary-disabled` and `primary-forced-colors` do not establish coverage
of a disabled primary button with forced colors. Document that combination if
needed. The configuration list is not a completeness or conformance claim.

Adding a configuration makes shared decisions apply to it, so review them as
part of that change. An old result never expands to the new configuration.

## Mixed decisions

Separate the invariant behavior from the detail that varies. For example,
write the focus-indicator behavior once for all enabled configurations, then
record each configuration's outline color separately. Each part gets its own
stable ID and can be referenced by a check. An unanswered color decision stays
`open` even when the shared focus behavior is `decided`.

Choose one component identity. A shared CSS class alone does not establish
shared semantics: an action button and a navigation link may need separate
records. AFS does not require any documentation framework or component library.

## Render or resolve

```sh
# Complete record, including every scope
node tools/fieldnote.mjs render examples/button.fieldnote.yaml

# One view, with shared and specific decisions and their original scope labels
node tools/fieldnote.mjs render examples/button.fieldnote.yaml --configuration secondary

# A self-contained JSON record for a selected configuration
node tools/fieldnote.mjs resolve examples/button.fieldnote.yaml --configuration secondary
```

Unknown configurations fail rather than yielding an empty document. The entire
source record is validated before selection, so invalid items in another
configuration cannot be hidden. The [secondary Markdown example](../examples/button-secondary.accessibility.md)
is generated from the button fieldnote.

## Results

Each observation names one `check`. If the fieldnote declares configurations,
it must also name exactly one `configuration`:

```yaml
check: name-check
configuration: primary
outcome: inconclusive
```

This is a partial observation; date, environment, and evidence are also required.
It records nothing about secondary, disabled, or forced-color configurations.
Record separate observations for each configuration actually assessed. Sharing
a check procedure does not share its outcome.

`validate --results` loads the local `fieldnote` path relative to the results
file, validates that record, then verifies check IDs and configuration scope.
For records without configurations, omit `configuration` in observations.
For other storage systems, call the exported `validateResults(results, fieldnote)`
with the matching source record after resolving it yourself. The exported
`validate(record, true)` performs structural validation only.

Validation does not execute checks, authenticate evidence, or establish that a
revision matches the code or current fieldnote. Keep results with the assessed
component and fieldnote revision in version control; updating either requires
review of the evidence. The [results fixture](../examples/button.results.json)
is explicitly synthetic and claims no assessment.

## Stable references

A decision ID identifies the same decision over time. Do not reuse it for an
unrelated decision. Splitting a mixed decision creates new IDs; update its
checks and external consumers explicitly. Do not silently rewrite historical
results. The renderer emits `decision-<id>` anchors in Markdown for linking to
generated documentation. Raw YAML/JSON consumers should parse the `decisions`
array and look up `id`; array positions and line numbers are not stable IDs.

## Why this shape

Real-use feedback described ten shared, three specific, and two mixed decisions
in a single button variant. That motivates reuse but does not establish that
this design fits every component. This draft tests shared edits, explicit state
and color-mode combinations, and results with limited scope using illustrative
data. Further component trials should inform the next revision.

Named configurations keep selection to membership checks in one file. Repeated
`appliesTo` lists are an explicit tradeoff: they avoid implicit merging while
keeping variant details in one place. Nested variants, selectors, and reusable
scope groups can wait for examples that demonstrate a need.
