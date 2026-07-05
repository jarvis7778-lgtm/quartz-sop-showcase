import { QuartzTransformerPlugin } from "../types"
import { Heading, PhrasingContent, Root } from "mdast"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import Slugger from "github-slugger"
import katex from "katex"
import { escapeHTML } from "../../util/escape"

export interface Options {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6
  minEntries: number
  showByDefault: boolean
  collapseByDefault: boolean
}

const defaultOptions: Options = {
  maxDepth: 3,
  minEntries: 1,
  showByDefault: true,
  collapseByDefault: false,
}

interface TocEntry {
  depth: number
  text: string
  html: string
  slug: string // this is just the anchor (#some-slug), not the canonical slug
}

const slugAnchor = new Slugger()

const renderTocHtml = (node: Heading): string => {
  const renderNode = (child: PhrasingContent): string => {
    switch (child.type) {
      case "text":
        return escapeHTML(child.value)
      case "inlineMath": {
        const normalized = child.value.replace(/\\{2}/g, "\\")
        return katex.renderToString(normalized, { displayMode: false, throwOnError: false })
      }
      case "inlineCode":
        return `<code>${escapeHTML(child.value)}</code>`
      case "break":
        return " "
      case "image":
        return escapeHTML(child.alt ?? "")
      default:
        if ("children" in child && Array.isArray(child.children)) {
          return child.children.map(renderNode).join("")
        }
        return ""
    }
  }

  return node.children.map(renderNode).join("")
}

export const TableOfContents: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "TableOfContents",
    markdownPlugins() {
      return [
        () => {
          return async (tree: Root, file) => {
            const display = file.data.frontmatter?.enableToc ?? opts.showByDefault
            if (display) {
              slugAnchor.reset()
              const toc: TocEntry[] = []
              let highestDepth: number = opts.maxDepth
              visit(tree, "heading", (node: Heading) => {
                if (node.depth <= opts.maxDepth) {
                  const text = toString(node)
                  highestDepth = Math.min(highestDepth, node.depth)
                  toc.push({
                    depth: node.depth,
                    text,
                    html: renderTocHtml(node),
                    slug: slugAnchor.slug(text),
                  })
                }
              })

              if (toc.length > 0 && toc.length > opts.minEntries) {
                file.data.toc = toc.map((entry) => ({
                  ...entry,
                  depth: entry.depth - highestDepth,
                }))
                file.data.collapseToc = opts.collapseByDefault
              }
            }
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    toc: TocEntry[]
    collapseToc: boolean
  }
}
