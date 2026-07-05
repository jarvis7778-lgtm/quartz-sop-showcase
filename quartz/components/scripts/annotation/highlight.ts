/**
 * DOM 高亮渲染
 *
 * 将注释的锚点还原到 DOM 并用 <mark> 元素包裹文本。
 * 使用 TreeWalker 遍历文本节点，逐个拆分并包裹。
 */

import type { Annotation } from "./types"
import { deserializeAnchor, getArticleRoot } from "./anchor"

/**
 * 为单个注释应用高亮
 */
export function applyHighlight(annotation: Annotation, root: HTMLElement): boolean {
  if (!annotation.anchor) {
    // 没有锚点数据，跳过
    return false
  }

  // 检查是否已经高亮过
  if (root.querySelector(`mark[data-ann-id="${annotation.id}"]`)) {
    return true
  }

  const range = deserializeAnchor(annotation.anchor, root)
  if (!range) {
    console.warn(`[annotation] 无法还原锚点: ${annotation.id}`)
    return false
  }

  try {
    wrapRangeWithMark(range, annotation.id)
    return true
  } catch (e) {
    console.warn(`[annotation] 高亮渲染失败: ${annotation.id}`, e)
    return false
  }
}

/**
 * 批量应用所有高亮
 */
export function applyAllHighlights(annotations: Annotation[], root: HTMLElement): void {
  for (const ann of annotations) {
    applyHighlight(ann, root)
  }
}

/**
 * 移除指定注释的高亮
 */
export function removeHighlight(id: string): void {
  const marks = document.querySelectorAll(`mark[data-ann-id="${id}"]`)
  marks.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    // 将 mark 内的子节点提升到 mark 的位置
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
    // 合并相邻文本节点
    parent.normalize()
  })
}

/**
 * 清除所有高亮
 */
export function clearAllHighlights(): void {
  const root = getArticleRoot()
  if (!root) return
  const marks = root.querySelectorAll("mark.ann-highlight")
  marks.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
    parent.normalize()
  })
}

/**
 * 获取高亮元素的位置（用于侧边栏对齐）
 */
export function getHighlightTop(id: string): number | null {
  const mark = document.querySelector(`mark[data-ann-id="${id}"]`)
  if (!mark) return null
  const rect = mark.getBoundingClientRect()
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  return rect.top + scrollTop
}

/**
 * 滚动到指定高亮位置并闪烁
 */
export function scrollToHighlight(id: string): void {
  const mark = document.querySelector(`mark[data-ann-id="${id}"]`) as HTMLElement
  if (!mark) return

  mark.scrollIntoView({ behavior: "smooth", block: "center" })

  // 添加闪烁动画
  mark.classList.add("ann-highlight-flash")
  setTimeout(() => {
    mark.classList.remove("ann-highlight-flash")
  }, 1500)
}

/**
 * 用 <mark> 包裹 Range 内的文本节点
 *
 * 核心逻辑：
 * 1. 找到 Range 涵盖的所有文本节点
 * 2. 对于部分选中的文本节点，先拆分
 * 3. 用 <mark> 包裹每个文本节点
 */
function wrapRangeWithMark(range: Range, annotationId: string): void {
  // 收集 Range 内的所有文本节点
  const textNodes = getTextNodesInRange(range)
  if (textNodes.length === 0) return

  for (const textNode of textNodes) {
    // 计算这个文本节点中被选中的部分
    let startOffset = 0
    let endOffset = textNode.textContent?.length || 0

    if (textNode === range.startContainer) {
      startOffset = range.startOffset
    }
    if (textNode === range.endContainer) {
      endOffset = range.endOffset
    }

    // 跳过空文本
    const selectedText = (textNode.textContent || "").substring(startOffset, endOffset)
    if (!selectedText || selectedText.length === 0) continue

    // 拆分文本节点
    let targetNode = textNode

    // 如果不是从开头开始选中
    if (startOffset > 0) {
      targetNode = textNode.splitText(startOffset)
      endOffset -= startOffset
    }

    // 如果不是选中到结尾
    if (endOffset < (targetNode.textContent?.length || 0)) {
      targetNode.splitText(endOffset)
    }

    // 用 <mark> 包裹
    const mark = document.createElement("mark")
    mark.className = "ann-highlight"
    mark.dataset.annId = annotationId
    targetNode.parentNode?.insertBefore(mark, targetNode)
    mark.appendChild(targetNode)
  }
}

/**
 * 获取 Range 内的所有文本节点
 */
function getTextNodesInRange(range: Range): Text[] {
  const root = range.commonAncestorContainer

  // 如果 commonAncestor 本身就是文本节点
  if (root.nodeType === Node.TEXT_NODE) {
    return [root as Text]
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text): number {
      // 检查节点是否在 Range 内
      if (range.intersectsNode(node)) {
        return NodeFilter.FILTER_ACCEPT
      }
      return NodeFilter.FILTER_REJECT
    },
  })

  const nodes: Text[] = []
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text)
  }

  return nodes
}
