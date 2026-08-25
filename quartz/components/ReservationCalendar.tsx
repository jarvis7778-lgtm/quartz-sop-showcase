import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/calendar.scss"
// @ts-ignore
import script from "./scripts/calendar.inline"

interface ReservationCalendarOptions {
  /** 标题 */
  title?: string
  /** 默认视图: month, week, day */
  defaultView?: "month" | "week" | "day"
  /** 工作时间开始 (小时) */
  workStartHour?: number
  /** 工作时间结束 (小时) */
  workEndHour?: number
}

const defaultOptions: ReservationCalendarOptions = {
  title: "实验预约",
  defaultView: "week",
  workStartHour: 8,
  workEndHour: 24,
}

export default ((userOpts?: ReservationCalendarOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const ReservationCalendar: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div
        class={classNames(displayClass, "reservation-calendar")}
        id="reservation-calendar"
        data-default-view={opts.defaultView}
        data-work-start={opts.workStartHour}
        data-work-end={opts.workEndHour}
      >
        <div class="calendar-header">
          <h2 class="calendar-title">{opts.title}</h2>
          <div class="calendar-controls">
            <button id="cal-prev" class="cal-nav-btn" aria-label="上一时间段">
              ◀
            </button>
            <span id="cal-current-range" class="cal-current-range"></span>
            <button id="cal-next" class="cal-nav-btn" aria-label="下一时间段">
              ▶
            </button>
            <button id="cal-today" class="cal-today-btn">
              今天
            </button>
          </div>
          <div class="calendar-view-switcher">
            <button class="view-btn" data-view="month">
              月
            </button>
            <button class="view-btn active" data-view="week">
              周
            </button>
            <button class="view-btn" data-view="day">
              日
            </button>
          </div>
        </div>

        <div id="calendar-container" class="calendar-container">
          <div class="calendar-loading">加载中...</div>
        </div>

        {/* 新建/编辑预约弹窗 */}
        <div
          id="reservation-modal"
          class="reservation-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{ display: "none" }}
        >
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <h3 id="modal-title">新建预约</h3>
            <p id="modal-meta" class="modal-meta" style={{ display: "none" }}></p>
            <form id="reservation-form">
              <div class="form-group">
                <label for="res-title">Title</label>
                <input
                  type="text"
                  id="res-title"
                  maxlength={200}
                  required
                  placeholder="e.g. Team review session"
                />
              </div>
              <div class="form-group">
                <label for="res-equipment">Resource (optional)</label>
                <input
                  type="text"
                  id="res-equipment"
                  placeholder="e.g. Meeting room, device, demo slot"
                />
              </div>
              <div class="form-group">
                <label for="res-description">描述 (可选)</label>
                <textarea
                  id="res-description"
                  maxlength={2000}
                  rows={2}
                  placeholder="补充说明..."
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="res-start">开始时间</label>
                  <input type="datetime-local" id="res-start" required />
                </div>
                <div class="form-group">
                  <label for="res-end">结束时间</label>
                  <input type="datetime-local" id="res-end" required />
                </div>
              </div>
              <div class="form-group">
                <label id="res-color-label">颜色</label>
                <div class="color-picker" id="color-picker">
                  <button
                    type="button"
                    class="color-option selected"
                    data-color="#3788d8"
                    style={{ background: "#3788d8" }}
                    aria-label="蓝色"
                  ></button>
                  <button
                    type="button"
                    class="color-option"
                    data-color="#28a745"
                    style={{ background: "#28a745" }}
                    aria-label="绿色"
                  ></button>
                  <button
                    type="button"
                    class="color-option"
                    data-color="#dc3545"
                    style={{ background: "#dc3545" }}
                    aria-label="红色"
                  ></button>
                  <button
                    type="button"
                    class="color-option"
                    data-color="#ffc107"
                    style={{ background: "#ffc107" }}
                    aria-label="黄色"
                  ></button>
                  <button
                    type="button"
                    class="color-option"
                    data-color="#6f42c1"
                    style={{ background: "#6f42c1" }}
                    aria-label="紫色"
                  ></button>
                  <button
                    type="button"
                    class="color-option"
                    data-color="#fd7e14"
                    style={{ background: "#fd7e14" }}
                    aria-label="橙色"
                  ></button>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" id="modal-cancel" class="btn-cancel">
                  取消
                </button>
                <button
                  type="button"
                  id="modal-delete"
                  class="btn-delete"
                  style={{ display: "none" }}
                >
                  删除
                </button>
                <button type="submit" class="btn-submit">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 登录提示 */}
        <div id="calendar-login-prompt" class="calendar-login-prompt" style={{ display: "none" }}>
          <p>请先登录后使用预约功能</p>
        </div>
      </div>
    )
  }

  ReservationCalendar.css = style
  ReservationCalendar.afterDOMLoaded = script

  return ReservationCalendar
}) satisfies QuartzComponentConstructor<ReservationCalendarOptions>
