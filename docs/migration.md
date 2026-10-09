# Migrate to 0.2.0

## Fieldnotes

For an existing flat 0.1.2 record, change `schemaVersion` to `0.2.0` and use the
current schema URL. No configuration or scope fields are required. Component
versions, benchmark versions, and guidance-pack versions are independent; keep
them as recorded.

To combine variant records:

1. Choose the component identity and declare the configurations being documented.
2. Keep genuinely shared decisions once, with no `appliesTo`.
3. Give different decisions unique IDs and explicit `appliesTo` lists. Split
   mixed behavior/token choices into separate decisions where appropriate.
4. Scope responsibilities, limitations, and checks as needed. Update decision
   references; a check cannot cover configurations its decisions do not cover.
5. Validate the whole record, then review the rendered view of each configuration.

New configurations receive shared decisions; review those decisions before
adding them. Configuration membership never implies verified accessibility.
See [configuration semantics](configurations.md).

## Results

Update result `schemaVersion` to `0.2.0`. The CLI now validates the linked
fieldnote, which must use the current format. Its `fieldnote` path is resolved
relative to the result file; the CLI accepts local file paths and does not
fetch network resources.

If the linked record declares configurations, each observation needs the ID of
the configuration actually assessed. Do not guess that ID or copy a passing
observation to other variants. If the original evidence cannot establish the
configuration, keep the historical result with its historical AFS checkout and
perform a new assessment. Flat records still require no configuration field.

Renamed check IDs require explicit review of their historical evidence. The
validator detects broken references; it does not migrate or refresh evidence.
