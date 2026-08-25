import { themeRegistry } from "../../themes"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentProps } from "./types"

const chapters = [
  {
    index: "01",
    title: "从零认识单片机",
    description: "认识 Arduino UNO、搭建 IDE，并用 Blink 完成第一次烧录。",
    slug: "tutorial/ch01-mcu-intro",
    meta: "入门 · LED 与按键",
  },
  {
    index: "02",
    title: "Arduino 编程基础",
    description: "掌握数字与模拟 IO、串口调试、传感器读取和常用 C++ 语法。",
    slug: "tutorial/ch02-arduino-programming",
    meta: "基础 · 4 个实操项目",
  },
  {
    index: "03",
    title: "ESP32 进阶开发",
    description: "把 Wi-Fi、BLE、Web Server 和 OTA 升级装进一块开发板。",
    slug: "tutorial/ch03-esp32-advanced",
    meta: "联网 · ESP32-S3",
  },
  {
    index: "04",
    title: "UART 串口通信",
    description: "从帧格式和波特率出发，完成 GPS 读取与双板数据互传。",
    slug: "tutorial/ch04-uart-serial",
    meta: "通信 · GPS 与双板",
  },
  {
    index: "05",
    title: "RS485 与 Modbus",
    description: "理解工业总线接线、方向控制、CRC 与主从设备通信。",
    slug: "tutorial/ch05-rs485-modbus",
    meta: "工业 · 电能表读取",
  },
  {
    index: "06",
    title: "MQTT 与物联网",
    description: "设计 Topic 和 JSON 消息，让 ESP32 安全地收发远程指令。",
    slug: "tutorial/ch06-mqtt-iot",
    meta: "物联网 · EMQX / MQTTX",
  },
  {
    index: "07",
    title: "Home Assistant",
    description: "用 ESPHome、MQTT 与自动化规则搭建自己的智能家居中枢。",
    slug: "tutorial/ch07-home-assistant",
    meta: "应用 · 自动化联动",
  },
  {
    index: "08",
    title: "传感器与执行器",
    description: "组合环境站、自动窗帘与安防系统，完成端到端项目。",
    slug: "tutorial/ch08-sensor-actuator-projects",
    meta: "实战 · 3 个综合项目",
  },
  {
    index: "09",
    title: "TinyML 边缘 AI",
    description: "把手势、图像与语音模型压缩后部署到 ESP32-S3。",
    slug: "tutorial/ch09-tinyml-edge-ai",
    meta: "AI · TFLite Micro",
  },
  {
    index: "10",
    title: "AI 语音控制硬件",
    description: "串起唤醒词、小智 AI、Home Assistant 与 Ollama 本地模型。",
    slug: "tutorial/ch10-ai-voice-hardware",
    meta: "进阶 · 语音到执行器",
  },
]

const learningStages = [
  ["基础", "第 1–3 章", "单片机、Arduino 与 ESP32，先建立能独立烧录和调试的开发闭环。"],
  ["通信", "第 4–6 章", "从 UART、RS485 到 MQTT，让设备从单机走向可靠连接。"],
  ["应用", "第 7–8 章", "接入 Home Assistant，把传感器、执行器和自动化组合成系统。"],
  ["AI", "第 9–10 章", "把 TinyML、语音与本地大模型带到真实硬件端。"],
]

const ShowcaseLanding: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const repositoryUrl =
    process.env.TEMPLATE_REPOSITORY_URL ?? "https://github.com/jarvis7778-lgtm/quartz-sop-template"
  const homeUrl = resolveRelative(fileData.slug!, "index" as FullSlug)
  const tutorialUrl = resolveRelative(fileData.slug!, "tutorial/index" as FullSlug)

  return (
    <article class="showcase-home" aria-label="硬件与 AI 实战教程首页">
      <header class="showcase-nav">
        <a class="showcase-brand" href={homeUrl} aria-label="硬件与 AI 实战教程首页">
          <span class="showcase-brand-mark" aria-hidden="true">
            H×A
          </span>
          <span>
            <strong>Hardware × AI</strong>
            <small>Hands-on Tutorial</small>
          </span>
        </a>
        <nav aria-label="首页导航">
          <a href="#roadmap">路径</a>
          <a href="#chapters">章节</a>
          <a href="#themes">主题</a>
          <a class="showcase-nav-cta" href={tutorialUrl}>
            开始学习 →
          </a>
        </nav>
      </header>

      <main>
        <section class="showcase-hero" aria-labelledby="showcase-title">
          <div class="showcase-hero-copy">
            <p class="showcase-eyebrow">
              <span aria-hidden="true" />
              零基础 · 十章 · 项目驱动
            </p>
            <h1 id="showcase-title">
              从一颗单片机，走到
              <em>能听懂你的 AI 硬件。</em>
            </h1>
            <p class="showcase-lede">
              一套从 Arduino、ESP32 和串口通信出发，逐步进入智能家居、TinyML
              与本地语音助手的中文实战教程。少一点抽象铺垫，多一次真实接线、烧录和验证。
            </p>
            <div class="showcase-actions">
              <a class="showcase-button primary" href={tutorialUrl}>
                打开完整教程 <span aria-hidden="true">→</span>
              </a>
              <a class="showcase-button secondary" href="#chapters">
                查看十章内容
              </a>
            </div>
            <dl class="showcase-stats" aria-label="教程摘要">
              <div>
                <dt>10</dt>
                <dd>核心章节</dd>
              </div>
              <div>
                <dt>4</dt>
                <dd>学习阶段</dd>
              </div>
              <div>
                <dt>0</dt>
                <dd>前置经验</dd>
              </div>
            </dl>
          </div>

          <div class="showcase-product" aria-label="ESP32 与 AI 硬件实验界面示意">
            <div class="showcase-window-bar">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <p>lab / esp32 / voice-control.ino</p>
            </div>
            <div class="showcase-window-body">
              <aside>
                <p class="showcase-window-label">LEARNING PATH</p>
                <strong>Hardware AI Lab</strong>
                <ul>
                  <li class="active">ESP32-S3</li>
                  <li>UART / RS485</li>
                  <li>MQTT / HA</li>
                  <li>TinyML / Voice</li>
                </ul>
              </aside>
              <div class="showcase-document">
                <div class="showcase-doc-kicker">SERIAL MONITOR · 115200 BAUD</div>
                <h2>语音控制实验</h2>
                <p>从唤醒词到继电器动作，每一段链路都能单独验证。</p>
                <ol>
                  <li class="done">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>ESP32-S3 已连接</strong>
                      <small>Wi-Fi RSSI −48 dBm</small>
                    </div>
                  </li>
                  <li class="done">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>唤醒词已识别</strong>
                      <small>edge inference 34 ms</small>
                    </div>
                  </li>
                  <li>
                    <span aria-hidden="true">3</span>
                    <div>
                      <strong>等待设备回执</strong>
                      <small>lab/light/set → ON</small>
                    </div>
                  </li>
                </ol>
                <div class="showcase-doc-note">
                  <span aria-hidden="true">↳</span>
                  每章都包含接线、代码、预期结果与排错路径。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          class="showcase-section showcase-capabilities"
          id="roadmap"
          aria-labelledby="roadmap-title"
        >
          <div class="showcase-section-heading">
            <div>
              <p>LEARNING ROADMAP</p>
              <h2 id="roadmap-title">从点亮 LED 到本地 AI 助手</h2>
            </div>
            <p>四个阶段层层复用前一阶段的硬件与通信能力，避免只会复制代码却无法定位故障。</p>
          </div>
          <div class="showcase-capability-list">
            {learningStages.map(([title, chapterRange, description], index) => (
              <article>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>
                  {title}
                  <small>{chapterRange}</small>
                </h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section class="showcase-section" id="chapters" aria-labelledby="chapters-title">
          <div class="showcase-section-heading">
            <div>
              <p>10 PRACTICAL CHAPTERS</p>
              <h2 id="chapters-title">按真实系统的生长顺序学习</h2>
            </div>
            <p>章节正文来自你的 LLM Wiki 教程副本；网站发布不会反向修改原始 Obsidian 内容。</p>
          </div>
          <div class="showcase-workflow-grid">
            {chapters.map((chapter) => (
              <a
                class="showcase-workflow-card"
                href={resolveRelative(fileData.slug!, chapter.slug as FullSlug)}
              >
                <span class="showcase-workflow-index">{chapter.index}</span>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.description}</p>
                </div>
                <footer>
                  <small>{chapter.meta}</small>
                  <span aria-hidden="true">↗</span>
                </footer>
              </a>
            ))}
          </div>
        </section>

        <section
          class="showcase-section showcase-themes"
          id="themes"
          aria-labelledby="themes-title"
        >
          <div class="showcase-section-heading">
            <div>
              <p>READING THEMES</p>
              <h2 id="themes-title">长教程，也可以按喜欢的方式阅读</h2>
            </div>
            <p>点击任意主题即可切换整个教程。选择会跨页面保留，不需要重新构建。</p>
          </div>
          <div class="showcase-theme-grid">
            {themeRegistry.map((manifest, index) => {
              const colors = manifest.theme.colors.lightMode
              return (
                <button
                  type="button"
                  class="showcase-theme-card"
                  data-showcase-theme={manifest.id}
                  aria-pressed="false"
                  style={`--theme-card-bg:${colors.light};--theme-card-ink:${colors.dark};--theme-card-accent:${colors.secondary};--theme-card-muted:${colors.lightgray}`}
                >
                  <span class="showcase-theme-number">{String(index + 1).padStart(2, "0")}</span>
                  <span class="showcase-theme-preview" aria-hidden="true">
                    <i />
                    <b />
                    <em />
                  </span>
                  <strong>{manifest.label}</strong>
                  <small>{manifest.description}</small>
                  <span class="showcase-theme-state">应用主题</span>
                </button>
              )
            })}
          </div>
        </section>

        <section class="showcase-publish" id="publish" aria-labelledby="publish-title">
          <div class="showcase-publish-copy">
            <p>BUILD · WIRE · VERIFY</p>
            <h2 id="publish-title">学完不是“看完”，而是让硬件真的回应你。</h2>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Build</strong>
                  <small>先让最小代码在目标开发板上编译和运行</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Wire</strong>
                  <small>逐条核对电压、引脚、共地与总线终端</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Verify</strong>
                  <small>用串口日志和设备回执确认完整数据链路</small>
                </div>
              </li>
            </ol>
          </div>
          <div class="showcase-terminal" aria-label="硬件调试终端示意">
            <div>
              <span />
              <span />
              <span />
              <small>serial-monitor</small>
            </div>
            <pre>
              <code>
                <i>$</i> connect esp32-s3 --baud 115200{"\n"}
                <b>✓</b> serial ready{"\n"}
                <i>$</i> publish lab/temperature 24.6{"\n"}
                <b>✓</b> mqtt round-trip 38 ms{"\n"}
                <i>$</i> run wake-word{"\n"}
                <b>✓</b> edge inference accepted
              </code>
            </pre>
          </div>
        </section>

        <section class="showcase-github" id="github-template" aria-labelledby="github-title">
          <div>
            <p>BUILD YOUR OWN</p>
            <h2 id="github-title">教程内容独立展示，建站能力做成可复制模板。</h2>
            <span>展示仓库承载这套硬件教程；公开模板保留主题、搜索和自动发布能力。</span>
          </div>
          <a href={repositoryUrl} target="_blank" rel="noreferrer">
            打开 GitHub 模板 <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>
    </article>
  )
}

export default ShowcaseLanding
