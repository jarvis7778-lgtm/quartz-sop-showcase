# 硬件 × AI 实战教程

从 Arduino、ESP32 和串口通信出发，逐步进入智能家居、TinyML 与本地 AI 语音助手的十章中文实战教程。

- 在线教程：<https://jarvis7778-lgtm.github.io/quartz-sop-showcase/>
- 可复用建站模板：<https://github.com/jarvis7778-lgtm/quartz-sop-template>

展示内容复制自本机 LLM Wiki 的 `device/hardware-ai-tutorial/`。这个仓库是一份发布副本：后续在源 Wiki 更新教程后，需要重新同步到这里；网站构建不会反向修改 Obsidian 原文件。

## 内容

- 第 1–3 章：单片机、Arduino 与 ESP32
- 第 4–6 章：UART、RS485/Modbus 与 MQTT
- 第 7–8 章：Home Assistant 与传感器/执行器项目
- 第 9–10 章：TinyML 与 AI 语音控制硬件
- 附录：硬件采购清单与参考来源

## 本地预览

需要 Node.js 22+ 与 npm 10.9+：

```bash
npm install
npm run dev
```

打开 <http://localhost:8081>。

## 构建

```bash
SITE_URL=jarvis7778-lgtm.github.io/quartz-sop-showcase npx quartz build
```

静态文件输出到 `public/`。GitHub Actions 会从 `main` 分支自动构建并发布 GitHub Pages。

## 安全说明

教程中的 Wi-Fi、MQTT 和服务地址均应在实际使用时替换。不要提交真实密码、访问令牌、家庭网络拓扑或可识别设备信息；涉及市电的操作必须在有经验的人指导下进行。

## License

Quartz 的 MIT 许可见 [`LICENSE.txt`](./LICENSE.txt)，第三方主题与字体说明见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。
