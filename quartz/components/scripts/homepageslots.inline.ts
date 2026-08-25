// Runtime homepage slot annotation. Stamps stable `data-theme-slot` attributes
// onto the real (Markdown-rendered) homepage DOM so theme CSS can target
// semantic slots instead of brittle nth-child chains. Idempotent and SPA-safe:
// re-runs on every `nav`, only acts on the index page.
//
// Slot vocabulary (stable contract — see docs/themes.md):
//   hero            the homepage hero wrapper (the <h1>)
//   hero-title      the homepage <h1> text (same node as hero here)
//   intro           the introductory paragraph following the hero
//   section-heading each <h2> section divider
//   feature-list    the "what's included" bullet list (no internal links)
//   start-links     the primary destinations list (internal links)
//   notice          the callout / notice blockquote

function annotateHomepage() {
  if (document.body?.dataset.slug !== "index") return

  // The rendered page article. Prefer the main content article; fall back to a
  // popover-hint wrapper if present.
  const article =
    document.querySelector<HTMLElement>(".center > article") ??
    document.querySelector<HTMLElement>(".center .popover-hint > article") ??
    document.querySelector<HTMLElement>("article")
  if (!article) return

  const setSlot = (el: Element | null | undefined, slot: string) => {
    if (el && !el.hasAttribute("data-theme-slot")) {
      el.setAttribute("data-theme-slot", slot)
    }
  }

  // hero / hero-title: first h1
  const h1 = article.querySelector(":scope > h1")
  setSlot(h1, "hero")
  if (h1) h1.setAttribute("data-theme-slot", "hero")
  // mark the title explicitly too (useful when themes wrap the h1)
  if (h1) h1.setAttribute("data-theme-slot-title", "hero-title")

  // intro: first paragraph in the article
  const intro = article.querySelector(":scope > p")
  setSlot(intro, "intro")

  // section headings
  for (const h2 of Array.from(article.querySelectorAll(":scope > h2"))) {
    setSlot(h2, "section-heading")
  }

  // lists: a list with internal links is the "start-links"; a plain bullet list
  // is the "feature-list".
  for (const ul of Array.from(article.querySelectorAll(":scope > ul"))) {
    const hasLink = !!ul.querySelector("a[href]")
    setSlot(ul, hasLink ? "start-links" : "feature-list")
  }

  // notice / callout
  const quote = article.querySelector(":scope > blockquote")
  setSlot(quote, "notice")
}

document.addEventListener("nav", annotateHomepage)
