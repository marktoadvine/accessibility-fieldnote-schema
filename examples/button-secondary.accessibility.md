# Example button — accessibility

Platform: web. Component version: example-only.

This record describes intended behavior. Check definitions are not verification results.

Configuration: **secondary**.

- **secondary** — Secondary, enabled (variant=secondary, state=enabled, colorMode=default)

This view covers only the selected configuration. Other configurations may be documented in the source fieldnote.

## Benchmarks

Sources informing decisions; not a conformance claim.

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Decisions

<a id="decision-element"></a>

### element

Applies to: all documented configurations.

Status: **decided**

Use a native button for actions. Navigation uses a separate link component.

<a id="decision-accessible-name"></a>

### accessible-name

Applies to: all documented configurations.

Status: **decided**

The visible text supplies the accessible name.

<a id="decision-text-resize"></a>

### text-resize

Applies to: all documented configurations.

Status: **decided**

Let the label wrap and the control grow when text is resized.

<a id="decision-focus-indicator"></a>

### focus-indicator

Applies to: primary, secondary, primary-forced-colors, secondary-forced-colors.

Status: **decided**

Show a 2px outline on focus-visible. The hover effect is not the focus indicator.

<a id="decision-secondary-focus-color"></a>

### Which outline token is distinguishable on the secondary button's supported surfaces?

Applies to: secondary.

Status: **open**

Unresolved.

<a id="decision-secondary-contrast"></a>

### What are the secondary text and background pairs and their measured contrast?

Applies to: secondary.

Status: **open**

Unresolved.

## Responsibilities

- **label** (consumer): Supply visible text describing the action.
  Applies to: all documented configurations.

## Known limitations

- **fixture-only**: This is an illustrative documentation fixture, not an implemented or assessed button.
  Applies to: all documented configurations.
- **secondary-palette**: The secondary focus and text contrast choices are unresolved.
  Applies to: secondary.

## Check definitions

- **name-check**: Inspect the computed accessible name and compare it with the visible text for the selected configuration.
  Applies to: all documented configurations.
  Method: manual; decisions: accessible-name.
- **focus-check**: Tab to the button and inspect the outline without relying on hover.
  Applies to: primary, secondary, primary-forced-colors, secondary-forced-colors.
  Method: manual; decisions: focus-indicator.
- **secondary-contrast-check**: Record the computed text/background pairs and measure contrast on supported surfaces.
  Applies to: secondary.
  Method: assisted; decisions: secondary-contrast.

