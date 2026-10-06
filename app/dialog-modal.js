// Generated from profiles/dialog-modal.json; run tools/sync_profile.py.
export default {
  "id": "dialog-modal",
  "version": "0.1.1",
  "title": "Modal dialog",
  "source": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  "notes": "Optional, experimental prompts authored for web modal dialogs using the listed source. Not a complete accessibility assessment, WCAG requirement catalogue, or native-app guidance. Review applies to this pack, not a claim of a new review by W3C.",
  "questions": [
    {
      "id": "name",
      "topic": "semantics",
      "question": "What names the dialog?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Identify the visible title and how it provides the accessible name."
    },
    {
      "id": "initial-focus",
      "topic": "focus",
      "question": "Where does focus go when it opens?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Choose an initial focus target appropriate to the content and task."
    },
    {
      "id": "keyboard-boundary",
      "topic": "keyboard",
      "question": "How does keyboard navigation behave while it is open?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Describe Tab and Shift+Tab behavior, and how background content becomes unavailable while modal."
    },
    {
      "id": "dismiss",
      "topic": "keyboard",
      "question": "How can someone dismiss it?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Describe Escape, the close or cancel control, and any context-dependent behavior."
    },
    {
      "id": "return-focus",
      "topic": "focus",
      "question": "Where does focus return when it closes?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Consider the trigger and what should happen if it no longer exists."
    },
    {
      "id": "long-content",
      "topic": "visual",
      "question": "What happens with long content, zoom, or a small viewport?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Consider scrolling, small viewports, readable text, and keeping focused controls visible."
    },
    {
      "id": "reduced-motion",
      "topic": "motion",
      "question": "What changes when reduced motion is requested?",
      "references": [
        {
          "standard": "W3C APG",
          "version": "unversioned living page",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
        }
      ],
      "hint": "Describe which transitions are removed or reduced while keeping the interaction understandable."
    }
  ],
  "status": "experimental",
  "platform": "web",
  "reviewedAt": "2026-10-06",
  "sources": [
    {
      "title": "W3C APG modal dialog pattern",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      "kind": "pattern-guidance",
      "version": "unversioned living page"
    }
  ]
};
