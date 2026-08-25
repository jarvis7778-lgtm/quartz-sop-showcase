/**
 * 文本选择 + 浮动工具栏
 *
 * 监听用户在 article 内的文本选择行为，
 * 显示浮动 "添加批注" 按钮，点击后弹出输入框。
 */

import type { AnchorData, Annotation } from "./types"
import { getArticleRoot, serializeRange } from "./anchor"
import { createAnnotation } from "./data"
import { applyHighlight } from "./highlight"
import { addAnnotationCard } from "./sidebar"

/** 浮动工具栏元素 */
let toolbar: HTMLElement | null = null
/** 当前选择的 Range */
let currentRange: Range | null = null
/** 输入弹窗 */
let notePopup: HTMLElement | null = null
/** 回调：新注释创建后 */
let onAnnotationCreated: ((ann: Annotation) => void) | null = null

/** 当前页面 slug */
let currentSlug = ""

/**
 * 初始化选择系统
 */
export function initSelection(
  slug: string,
  createdCallback: (ann: Annotation) => void,
): () => void {
  currentSlug = slug
  onAnnotationCreated = createdCallback

  const root = getArticleRoot()
  if (!root) return () => {}

  // 创建工具栏（复用或新建）
  toolbar = document.getElementById("ann-toolbar")
  if (!toolbar) {
    toolbar = document.createElement("div")
    toolbar.id = "ann-toolbar"
    toolbar.className = "ann-toolbar"
    toolbar.innerHTML = `
      <button class="ann-toolbar-btn" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>批注</span>
      </button>
    `
    toolbar.style.display = "none"
    document.body.appendChild(toolbar)
  }

  // 创建备注输入弹窗
  notePopup = document.getElementById("ann-note-popup")
  if (!notePopup) {
    notePopup = document.createElement("div")
    notePopup.id = "ann-note-popup"
    notePopup.className = "ann-note-popup"
    notePopup.innerHTML = `
      <div class="ann-note-popup-inner">
        <textarea class="ann-note-input" maxlength="5000" placeholder="添加批注说明（可选）..." rows="3"></textarea>
        <div class="ann-note-actions">
          <button class="ann-note-cancel" type="button">取消</button>
          <button class="ann-note-save" type="button">保存</button>
        </div>
      </div>
    `
    notePopup.style.display = "none"
    document.body.appendChild(notePopup)
  }

  // 事件处理
  const handleMouseUp = (e: Event) => {
    // 忽略来自工具栏和弹窗内部的点击
    const target = e.target as HTMLElement
    if (toolbar?.contains(target) || notePopup?.contains(target)) return

    setTimeout(() => showToolbarIfSelection(), 10)
  }

  const handleTouchEnd = (e: Event) => {
    // 忽略来自工具栏和弹窗内部的触摸
    const target = e.target as HTMLElement
    if (toolbar?.contains(target) || notePopup?.contains(target)) return

    // 延长移动端延迟，等待系统选择 UI 完成
    setTimeout(() => showToolbarIfSelection(), 300)
  }

  const handleMouseDown = () => {
    hideToolbar()
  }

  const handleToolbarClick = () => {
    showNotePopup()
  }

  const handleNoteCancel = () => {
    hideNotePopup()
    hideToolbar()
  }

  const handleNoteSave = () => {
    saveAnnotation()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (notePopup?.style.display !== "none") {
        hideNotePopup()
      }
      hideToolbar()
    }
  }

  const handleDocClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (
      toolbar?.style.display !== "none" &&
      !toolbar?.contains(target) &&
      !notePopup?.contains(target) &&
      !root.contains(target)
    ) {
      hideToolbar()
      hideNotePopup()
    }
  }

  // 绑定事件
  root.addEventListener("mouseup", handleMouseUp)
  root.addEventListener("touchend", handleTouchEnd)
  root.addEventListener("mousedown", handleMouseDown)

  const toolbarBtn = toolbar.querySelector(".ann-toolbar-btn")
  toolbarBtn?.addEventListener("click", handleToolbarClick)

  const cancelBtn = notePopup.querySelector(".ann-note-cancel")
  cancelBtn?.addEventListener("click", handleNoteCancel)

  const saveBtn = notePopup.querySelector(".ann-note-save")
  saveBtn?.addEventListener("click", handleNoteSave)

  // 允许 Ctrl+Enter / Cmd+Enter 保存
  const textarea = notePopup.querySelector(".ann-note-input") as HTMLTextAreaElement
  textarea?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      saveAnnotation()
    }
  })

  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("mousedown", handleDocClick)

  // 返回清理函数
  return () => {
    root.removeEventListener("mouseup", handleMouseUp)
    root.removeEventListener("touchend", handleTouchEnd)
    root.removeEventListener("mousedown", handleMouseDown)
    toolbarBtn?.removeEventListener("click", handleToolbarClick)
    cancelBtn?.removeEventListener("click", handleNoteCancel)
    saveBtn?.removeEventListener("click", handleNoteSave)
    document.removeEventListener("keydown", handleKeyDown)
    document.removeEventListener("mousedown", handleDocClick)

    hideToolbar()
    hideNotePopup()
    toolbar?.remove()
    notePopup?.remove()
    toolbar = null
    notePopup = null
    currentRange = null
  }
}

/**
 * 如果有有效选区则显示工具栏
 */
function showToolbarIfSelection() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.rangeCount) {
    hideToolbar()
    return
  }

  const root = getArticleRoot()
  if (!root) return

  const range = sel.getRangeAt(0)

  // 确保选区在 article 内
  if (!root.contains(range.commonAncestorContainer)) {
    hideToolbar()
    return
  }

  // 确保选中了实际文本
  const text = range.toString().trim()
  if (!text || text.length === 0) {
    hideToolbar()
    return
  }

  currentRange = range.cloneRange()

  // 定位工具栏到选区上方
  const rect = range.getBoundingClientRect()
  if (!toolbar) return

  toolbar.style.display = "flex"
  toolbar.style.position = "fixed"
  toolbar.style.left = `${rect.left + rect.width / 2}px`
  toolbar.style.top = `${rect.top - 8}px`
  toolbar.style.transform = "translate(-50%, -100%)"
  toolbar.style.zIndex = "9999"
}

function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = "none"
  }
}

/**
 * 显示备注输入弹窗（桌面：浮动定位；移动端：底部弹窗）
 */
function showNotePopup() {
  if (!notePopup || !currentRange) return

  const isMobile = window.innerWidth <= 800

  if (isMobile) {
    // 移动端：底部弹窗模式
    notePopup.style.display = "block"
    notePopup.style.position = "fixed"
    notePopup.style.left = "0"
    notePopup.style.right = "0"
    notePopup.style.bottom = "0"
    notePopup.style.top = "auto"
    notePopup.style.transform = "none"
    notePopup.style.zIndex = "10000"
    notePopup.classList.add("ann-note-popup-mobile")
  } else {
    // 桌面端：浮动定位到选区下方
    const rect = currentRange.getBoundingClientRect()
    notePopup.style.display = "block"
    notePopup.style.position = "fixed"
    notePopup.style.left = `${rect.left + rect.width / 2}px`
    notePopup.style.top = `${rect.bottom + 8}px`
    notePopup.style.right = ""
    notePopup.style.bottom = ""
    notePopup.style.transform = "translateX(-50%)"
    notePopup.style.zIndex = "10000"
    notePopup.classList.remove("ann-note-popup-mobile")
  }

  // 聚焦文本框
  const textarea = notePopup.querySelector(".ann-note-input") as HTMLTextAreaElement
  if (textarea) {
    textarea.value = ""
    textarea.focus()
  }

  hideToolbar()
}

function hideNotePopup() {
  if (notePopup) {
    notePopup.style.display = "none"
  }
}

/**
 * 保存注释
 */
async function saveAnnotation() {
  if (!currentRange) return

  const root = getArticleRoot()
  if (!root) return

  const quote = currentRange.toString().trim()
  if (!quote) return

  const textarea = notePopup?.querySelector(".ann-note-input") as HTMLTextAreaElement
  const note = textarea?.value?.trim() || ""

  // 禁用保存按钮防止重复点击
  const saveBtn = notePopup?.querySelector(".ann-note-save") as HTMLButtonElement
  if (saveBtn) {
    saveBtn.disabled = true
    saveBtn.textContent = "保存中..."
  }

  let saved = false
  try {
    const anchor: AnchorData = serializeRange(currentRange, root)
    const annotation = await createAnnotation({
      pageSlug: currentSlug,
      anchor,
      quote,
      note,
    })

    if (annotation) {
      // 立即应用高亮
      applyHighlight(annotation, root)
      // 添加到侧边栏
      addAnnotationCard(annotation)
      // 通知回调
      onAnnotationCreated?.(annotation)
      saved = true
    } else {
      alert("批注保存失败：数据库写入失败，请刷新后重试。")
    }
  } catch (err) {
    console.error("[annotation] 保存失败:", err)
    alert("批注保存失败：请稍后重试，或打开控制台查看错误信息。")
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false
      saveBtn.textContent = "保存"
    }
  }

  if (saved) {
    hideNotePopup()
    currentRange = null
    // 清除选区
    window.getSelection()?.removeAllRanges()
  }
}
