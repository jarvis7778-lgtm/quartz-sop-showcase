import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import ShowcaseLanding from "../ShowcaseLanding"
// @ts-ignore
import showcaseScript from "../scripts/showcase.inline"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  if (fileData.slug === "index") {
    return <ShowcaseLanding {...props} />
  }

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}

Content.afterDOMLoaded = showcaseScript

export default (() => Content) satisfies QuartzComponentConstructor
