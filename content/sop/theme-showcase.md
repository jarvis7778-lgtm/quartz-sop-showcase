---
title: Theme Showcase
tags:
  - reference
---

# Theme Showcase

This page is a visual stress test. It exercises every common Markdown element so you can
evaluate a theme's typography, spacing, color, and component styling at a glance. Switch the
preset in `site.theme.ts` and rebuild to compare **current**, **minimal**, and **notion**.

## Heading hierarchy

The six heading levels below should read as a clear, calm hierarchy — distinct in weight and
size without shouting.

### Section heading (h3)

#### Subsection heading (h4)

##### Minor heading (h5)

###### Smallest heading (h6)

## Body text and inline formatting

A standard operating procedure should be effortless to skim. Body copy needs comfortable line
length and generous line height. This paragraph mixes **bold emphasis**, _italic nuance_,
**_bold italic_**, `inline code`, and a [standard external link](https://quartz.jzhao.xyz).
Internal links such as [[index|the homepage]], [[sop/index|the SOP Library]], and
[[sop/example-onboarding|the onboarding example]] should feel native to the document, not
bolted on.

You can also reference shared resources like [[calendar|the reservation calendar]] inline to
guide readers toward the next action.

## Callouts

> [!note] Note
> Callouts group supporting context away from the main flow. A good theme makes them feel
> like a quiet aside, not a loud banner.

> [!tip] Tip
> Keep each SOP step short and independently verifiable.

> [!warning] Before you publish
> Remove private names, internal URLs, and credentials before pushing a page to the public site.

> A plain blockquote without a callout type should still read as a calm, indented aside with a
> subtle left rule.

## Lists

### Unordered list

- Crisp bullets with comfortable spacing
- Nested structure stays legible
  - Second level
  - Second level with `inline code`
    - Third level
- Back to the top level

### Ordered list

1. Open the procedure in your editor.
2. Make one focused change.
3. Preview locally with `npx quartz build --serve`.
4. Commit with a descriptive message.

### Task list

- [x] Read the core SOPs
- [x] Confirm access to required tools
- [ ] Complete a small starter contribution
- [ ] Review the feedback process

## Code

Inline code like `siteTheme.preset` should sit comfortably in a sentence. Fenced blocks need
clear contrast and a readable monospace face:

```ts
import { ThemePresetName } from "./themes"

// Switch the active theme preset here, then rebuild.
export const siteTheme = {
  preset: "minimal" as ThemePresetName,
}
```

```bash
npm run check
npx quartz build --serve
```

## Math

Inline math renders alongside prose: the Gaussian normalization constant is
$\frac{1}{\sigma\sqrt{2\pi}}$, and Euler's identity $e^{i\pi} + 1 = 0$ should sit on the
baseline cleanly.

Display math is centered on its own line:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

$$
\mathbf{y} = \sigma\!\left( \mathbf{W}\mathbf{x} + \mathbf{b} \right)
$$

## Table

| Step              | Owner      | Tool         | Status      |
| ----------------- | ---------- | ------------ | ----------- |
| Draft procedure   | New member | Editor       | In progress |
| Technical review  | Buddy      | Pull request | Pending     |
| Approve and merge | Lead       | Git          | Blocked     |
| Publish           | Maintainer | CI           | Done        |

## Figure

A figure-style section: an image with a caption. The placeholder below should scale to the
content width with appropriate spacing and a readable caption.

![Placeholder diagram of an onboarding flow](https://placehold.co/960x420/png?text=Onboarding+Flow+Diagram)

_Figure 1 — Replace this placeholder with a real diagram once private details are removed._

## Horizontal rule

A horizontal rule separates major sections without adding visual noise.

---

That is the full stress test. A well-designed theme should make every element above feel
intentional and consistent.
