import CoreContent from "../quartz/components/pages/Content"
import { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import ShowcaseLanding from "./ShowcaseLanding"
// @ts-ignore
import showcaseScript from "./scripts/showcase.inline"

const Article = CoreContent()
const Content: QuartzComponent = (props) =>
  props.fileData.slug === "index" ? <ShowcaseLanding {...props} /> : <Article {...props} />
Content.afterDOMLoaded = showcaseScript
export default (() => Content) satisfies QuartzComponentConstructor
