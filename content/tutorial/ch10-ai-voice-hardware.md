# 第10章：AI 语音控制 + 硬件联动

## 学习目标

学完本章，你将能够：
- 理解语音唤醒词检测原理
- 在ESP32-S3上实现离线语音识别
- 使用小智AI开源方案打造语音助手
- 构建完整的语音→MQTT→设备联动链路
- 在树莓派5上部署本地LLM（Ollama）

---

## 10.1 语音唤醒词检测原理

### 什么是唤醒词？

唤醒词（Wake Word）是让设备从休眠状态"醒来"的关键词，如"你好小爱"、"Alexa"、"Hey Siri"。

### 工作原理

```
麦克风 → 音频采集 → 特征提取(MFCC) → 唤醒词模型(TFLite) → 命中/未命中
  │                                                              │
  │ ←── 持续低功耗运行（~1mA）                    命中后激活完整系统 ──→ │
```

### 关键技术点

1. **MFCC特征提取**：将音频信号转换为梅尔频率倒谱系数
2. **滑动窗口**：连续分析最近N毫秒的音频
3. **阈值判断**：置信度超过阈值才触发
4. **误触发抑制**：防止电视/广播中的类似声音触发

---

## 10.2 ESP32-S3 离线语音识别方案

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| TFLite Micro (Micro Speech) | 官方支持，开源 | 只能识别简单关键词 |
| 乐鑫ESP-SR | 中文支持好，性能优化 | 需要乐鑫芯片 |
| 小智AI (XiaoZhi) | 开源，支持LLM对话 | 需要联网 |
| Edge Impulse自定义 | 完全自定义 | 需要自己采集训练数据 |

---

## 10.3 小智AI开源语音助手

小智AI（XiaoZhi）是2025-2026年最火的开源AI语音助手项目，基于ESP32-S3。

### 硬件要求

- ESP32-S3-WROOM-1-N16R8（16MB Flash + 8MB PSRAM）
- INMP441数字麦克风
- MAX98357 I2S功放 + 喇叭（可选，用于语音回复）
- 0.96寸OLED显示屏（可选）

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/78/xiaozhi-esp32.git
cd xiaozhi-esp32
```

2. **配置WiFi和服务器**
```cpp
// 在 main/config.h 中修改
#define WIFI_SSID "你的WiFi名"
#define WIFI_PASSWORD "你的WiFi密码"
#define SERVER_URL "wss://api.tenclass.net/ws/xiaozhi"  // 服务器地址
```

3. **编译烧录**
```bash
idf.py build
idf.py -p /dev/ttyUSB0 flash
```

### 工作流程

```
用户说"你好小智" → ESP32检测唤醒词 → 建立WebSocket连接
    → 用户说"帮我开灯" → 音频上传到服务器
    → 服务器LLM解析意图 → 返回"开灯"指令
    → ESP32通过MQTT控制灯
```

---

## 10.4 语音控制智能家居完整链路

### 架构图

```
┌─────────────┐    WebSocket    ┌──────────────┐
│  ESP32-S3   │ ◄─────────────► │  AI服务器    │
│  (小智AI)   │                 │  (意图解析)   │
└──────┬──────┘                 └──────────────┘
       │ MQTT
       ▼
┌─────────────┐                 ┌─────────────┐
│   MQTT      │ ◄──────────────►│   Home      │
│   Broker    │                 │  Assistant  │
└──────┬──────┘                 └──────┬──────┘
       │                               │
       ▼                               ▼
┌─────────────┐                 ┌─────────────┐
│   ESP32     │                 │   智能设备   │
│   设备端    │ ─── 继电器 ───► │   灯/风扇   │
└─────────────┘                 └─────────────┘
```

### 实现方式

#### 方式一：ESP32-S3直接控制

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP_I2S.h>

WiFiClient espClient;
PubSubClient mqtt(espClient);

// 语音指令处理
void processVoiceCommand(String command) {
    command.toLowerCase();
    
    if (command.indexOf("开灯") >= 0) {
        mqtt.publish("home/light/control", "ON");
        Serial.println("执行: 开灯");
    } else if (command.indexOf("关灯") >= 0) {
        mqtt.publish("home/light/control", "OFF");
        Serial.println("执行: 关灯");
    } else if (command.indexOf("开风扇") >= 0) {
        mqtt.publish("home/fan/control", "ON");
        Serial.println("执行: 开风扇");
    } else if (command.indexOf("关风扇") >= 0) {
        mqtt.publish("home/fan/control", "OFF");
        Serial.println("执行: 关风扇");
    }
}

// 唤醒词检测回调
void onWakeWordDetected() {
    Serial.println("唤醒词已检测到，开始监听...");
    
    // 录音3秒
    recordAudio(3000);
    
    // 上传到服务器进行意图识别
    String intent = recognizeIntent(audioData);
    
    // 处理意图
    processVoiceCommand(intent);
}
```

#### 方式二：通过Home Assistant中转

```yaml
# HA自动化配置
automation:
  - alias: "语音开灯"
    trigger:
      - platform: mqtt
        topic: "home/voice/command"
        payload: "开灯"
    action:
      - service: light.turn_on
        entity_id: light.living_room
```

---

## 10.5 树莓派5 + Ollama 本地AI助手

### 为什么用树莓派？

- 本地运行LLM，隐私有保障
- 离线可用
- 可以同时运行Home Assistant

### 安装Ollama

```bash
# 在树莓派5上（ARM64系统）
curl -fsSL https://ollama.ai/install.sh | sh

# 下载轻量模型（适合树莓派5 8GB）
ollama pull qwen2.5:3b  # 3B参数模型，约2GB
```

### Python代码：自然语言控制设备

```python
import ollama
import paho.mqtt.client as mqtt

# MQTT配置
MQTT_BROKER = "localhost"
mqtt_client = mqtt.Client(client_id="raspberry_pi_ai_assistant")
mqtt_client.connect(MQTT_BROKER, 1883, 60)

# 设备映射
device_map = {
    "客厅灯": "home/living_room/light",
    "卧室灯": "home/bedroom/light",
    "风扇": "home/fan/control",
    "窗帘": "home/curtain/control"
}

def parse_command(user_input):
    """用LLM解析用户意图"""
    prompt = f"""
你是一个智能家居控制助手。请分析用户的指令，输出JSON格式的控制命令。

可用设备：{list(device_map.keys())}

用户指令：{user_input}

请输出JSON格式：
{{"device": "设备名", "action": "ON/OFF/具体值"}}
"""
    
    response = ollama.chat(model='qwen2.5:3b', messages=[
        {'role': 'user', 'content': prompt}
    ])
    
    return response['message']['content']

def execute_command(command_json):
    """执行控制命令"""
    import json
    
    try:
        cmd = json.loads(command_json)
        device = cmd.get("device", "")
        action = cmd.get("action", "")
        
        if device in device_map:
            topic = device_map[device]
            mqtt_client.publish(topic, action)
            print(f"已发送: {topic} → {action}")
            return f"已{action} {device}"
        else:
            return f"未知设备: {device}"
    except:
        return "无法解析指令"

# 主循环
print("=== 本地AI智能家居助手 ===")
print("输入自然语言指令，如：'帮我把客厅灯打开'")

while True:
    user_input = input("\n请输入指令: ")
    if user_input.lower() in ['quit', 'exit', '退出']:
        break
    
    print("正在理解指令...")
    command_json = parse_command(user_input)
    print(f"解析结果: {command_json}")
    
    result = execute_command(command_json)
    print(f"执行结果: {result}")
```

### 运行效果

```
=== 本地AI智能家居助手 ===
输入自然语言指令，如：'帮我把客厅灯打开'

请输入指令: 帮我把客厅灯关了
正在理解指令...
解析结果: {"device": "客厅灯", "action": "OFF"}
执行结果: 已OFF 客厅灯

请输入指令: 天太热了，开一下风扇
正在理解指令...
解析结果: {"device": "风扇", "action": "ON"}
执行结果: 已ON 风扇
```

---

## 10.6 MCP协议：多端AI控制（进阶）

MCP（Model Context Protocol）是2025-2026年的热门协议，用于让AI模型与外部工具交互。

### 概念简介

```
用户 → AI模型(LLM) → MCP Server → 设备控制
                        │
                   工具注册表：
                   - turn_on_light
                   - turn_off_fan
                   - get_temperature
```

### 简单示例

```python
# MCP Server示例（使用FastMCP）
from fastmcp import FastMCP

mcp = FastMCP("Smart Home MCP")

@mcp.tool()
def turn_on_light(room: str) -> str:
    """打开指定房间的灯"""
    # MQTT控制逻辑
    return f"{room}的灯已打开"

@mcp.tool()
def turn_off_light(room: str) -> str:
    """关闭指定房间的灯"""
    return f"{room}的灯已关闭"

@mcp.tool()
def get_temperature() -> float:
    """获取当前温度"""
    # 读取传感器
    return 25.5

if __name__ == "__main__":
    mcp.run()
```

---

## 扩展思考

1. **隐私保护**
   - 本地语音处理不需要上传音频
   - Ollama本地推理不需要API Key
   - 敏感数据不出家门

2. **多模态交互**
   - 语音 + 手势 + 触摸屏
   - 图像识别 + 语音合成
   - 情感识别（语调分析）

3. **进阶方向**
   - 多房间语音系统
   - 个性化语音助手（学习用户习惯）
   - 与大模型深度集成（记忆、上下文理解）
