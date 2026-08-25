// @ts-ignore
import homepageSlotsScript from "./scripts/homepageslots.inline"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

// The homepage is authored as plain Markdown, so there are no React homepage
// classes to hang theme CSS on. Rather than fake a bespoke homepage component
// (which would fork content per theme), this component ships a tiny runtime
// annotation layer: on the index page it stamps STABLE `data-theme-slot`
// attributes onto the real rendered DOM (hero title, intro, section headings,
// feature list, start links, notice). Community and preset CSS can then target
// `[data-theme-slot="…"]` instead of brittle `nth-child` selectors.
//
// It renders no visible markup — only the behavior. Existing presets keep
// working; new styles opt into the slots.
const HomepageSlots: QuartzComponent = () => null

HomepageSlots.beforeDOMLoaded = homepageSlotsScript

export default (() => HomepageSlots) satisfies QuartzComponentConstructor
