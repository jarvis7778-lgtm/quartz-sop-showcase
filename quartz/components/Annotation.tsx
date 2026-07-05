import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/annotation.scss"
// @ts-ignore
import script from "./scripts/annotation.inline"

interface AnnotationOptions {
  /** 侧边栏标题 */
  title?: string
}

const defaultOptions: AnnotationOptions = {
  title: "页面批注",
}

export default ((userOpts?: AnnotationOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Annotation: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "annotation")} id="annotation-container">
        <button
          type="button"
          id="annotation-toggle"
          class="annotation-header"
          aria-controls="annotation-sidebar-list"
          aria-expanded="true"
        >
          <h3>{opts.title}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div id="annotation-sidebar-list" class="annotation-sidebar-list"></div>
      </div>
    )
  }

  Annotation.css = style
  Annotation.afterDOMLoaded = script

  return Annotation
}) satisfies QuartzComponentConstructor<AnnotationOptions>
