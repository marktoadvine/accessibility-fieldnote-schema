# Confirmation dialogue — accessibility

Platform: web. Component version: 0.1.0.

This record describes intended behavior. Check definitions are not verification results.

## Benchmarks

Sources informing decisions; not a conformance claim.

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Decisions

<a id="decision-name"></a>

### What names the dialog?

Status: **open**

Unresolved.

<a id="decision-initial-focus"></a>

### Where does focus go when it opens?

Status: **decided**

For this destructive confirmation, focus the Cancel button when opened.

Reason: Avoid positioning focus on the destructive action.

<a id="decision-keyboard-boundary"></a>

### How does keyboard navigation behave while it is open?

Status: **open**

Unresolved.

<a id="decision-dismiss"></a>

### How can someone dismiss it?

Status: **open**

Unresolved.

<a id="decision-return-focus"></a>

### Where does focus return when it closes?

Status: **open**

Unresolved.

<a id="decision-long-content"></a>

### What happens with long content, zoom, or a small viewport?

Status: **open**

Unresolved.

<a id="decision-reduced-motion"></a>

### What changes when reduced motion is requested?

Status: **open**

Unresolved.

## Responsibilities

- **provide-title** (consumer): Provide a visible title that describes the action.

## Known limitations

None recorded.


## Check definitions

- **initial-focus-check**: Open the dialog from its trigger and confirm that keyboard focus lands on Cancel.
  Method: manual; decisions: initial-focus.

