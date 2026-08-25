# 第3章：ESP32进阶开发

> 📚 **学习进度**：本章承接第1-2章内容，假设你已经掌握Arduino UNO基础编程。现在我们将进入ESP32的世界——一款集成了WiFi和蓝牙的强大微控制器。

## 🎯 学习目标

完成本章后，你将能够：
1. 理解ESP32与Arduino UNO的核心差异及优势
2. 选择合适的ESP32开发板型号
3. 使用ESP32连接WiFi并处理断线重连
4. 搭建ESP32 Web服务器实现远程控制
5. 使用ESP32的BLE蓝牙功能
6. 实现OTA空中升级功能

## 📖 知识点讲解（30%）

### 3.1 ESP32 vs Arduino UNO：能力对比

| 特性 | Arduino UNO | ESP32 |
|------|-------------|-------|
| **处理器** | 8位 AVR @ 16MHz | 32位 Xtensa @ 240MHz（双核） |
| **内存** | 2KB SRAM, 32KB Flash | 520KB SRAM, 4MB+ Flash |
| **WiFi** | ❌ 无 | ✅ 802.11 b/g/n |
| **蓝牙** | ❌ 无 | ✅ BT 4.2 + BLE |
| **ADC** | 10位 (0-1023) | 12位 (0-4095) |
| **GPIO** | 14个数字, 6个模拟 | 34个可编程GPIO |
| **PWM** | 6个引脚 | 几乎所有GPIO |
| **工作电压** | 5V | 3.3V |
| **功耗** | ~50mA | ~80mA（WiFi开启） |

**核心优势**：
- **性能提升15倍**：240MHz双核 vs 16MHz单核
- **内置无线**：无需外接WiFi/蓝牙模块
- **更大内存**：可运行复杂程序和存储网页
- **更多接口**：I2C、SPI、UART均可自由映射

### 3.2 ESP32-S3 特色功能

ESP32-S3是ESP32系列的升级版，专为AI和边缘计算设计：

**AI向量指令（SIMD）**：
- 支持向量运算，加速神经网络推理
- 适用于图像识别、语音唤醒等AI应用

**USB OTG**：
- 支持USB Host和Device模式
- 可直接连接U盘、键盘、鼠标

**摄像头接口**：
- 内置DVP摄像头接口
- 支持OV2640、OV5640等摄像头模块
- 适合智能门锁、监控等视觉应用

**LCD接口**：
- 支持8/16位并行LCD
- 内置RGB LCD控制器

### 3.3 ESP32 开发板选型指南

| 开发板 | 芯片 | 适用场景 | 特点 |
|--------|------|----------|------|
| **ESP32-DevKitC** | ESP32 | 通用开发、学习 | 最常用，资料丰富 |
| **ESP32-S3-DevKitC-1** | ESP32-S3 | AI视觉、USB应用 | 支持AI加速、USB OTG |
| **ESP32-C3-DevKitM-1** | ESP32-C3 | 低功耗、成本敏感 | RISC-V内核，功耗低 |
| **ESP32-WROOM-32** | ESP32 | 产品原型 | 集成天线，尺寸小 |

**选型建议**：
- **初学者首选**：ESP32-DevKitC（资料最多，社区活跃）
- **AI项目**：ESP32-S3-DevKitC-1（支持神经网络加速）
- **量产产品**：ESP32-WROOM-32模组（集成度高）
- **低功耗场景**：ESP32-C3-DevKitM-1（RISC-V架构，功耗低）

### 3.4 Arduino框架 vs ESP-IDF 框架

**Arduino框架**（本教程使用）：
- 优点：上手简单，与Arduino UNO代码兼容性好
- 缺点：性能损耗，部分高级功能受限
- 适合：快速原型、学习、简单项目

**ESP-IDF框架**：
- 优点：官方原生支持，性能最优，功能完整
- 缺点：学习曲线陡峭，需要C语言基础
- 适合：产品开发、性能要求高的项目

**关系**：Arduino框架底层实际调用了ESP-IDF的API，两者可混合使用。

### 3.5 ESP32的WiFi功能

ESP32支持两种WiFi模式：

**STA模式（Station）**：
- 作为客户端连接到现有WiFi网络
- 类似手机连接路由器
- 用于物联网设备接入互联网

**AP模式（Access Point）**：
- 自己创建WiFi热点
- 其他设备可连接到ESP32
- 用于设备配置、局域网通信

**混合模式（AP+STA）**：
- 同时作为客户端和热点
- 用于WiFi中继器等场景

### 3.6 ESP32的BLE蓝牙基础

BLE（Bluetooth Low Energy）低功耗蓝牙特点：
- **功耗极低**：纽扣电池可运行数年
- **传输距离**：理论100米，实际10-30米
- **数据速率**：1Mbps（理论值）
- **连接方式**：主从模式，一个主机可连多个从机

**核心概念**：
- **GATT**：通用属性配置文件，定义数据结构
- **Service**：服务，一组相关特征的集合
- **Characteristic**：特征，具体的数据点（如温度值）
- **UUID**：唯一标识符，区分不同服务和特征

### 3.7 Web服务器开发

ESP32可作为Web服务器，通过浏览器访问控制：

**工作原理**：
1. ESP32连接WiFi，获取IP地址
2. 创建HTTP服务器监听80端口
3. 浏览器访问ESP32的IP地址
4. ESP32返回HTML页面
5. 用户在页面上操作，ESP32处理请求

**应用场景**：
- 智能家居控制面板
- 传感器数据可视化
- 设备配置界面
- 远程监控系统

### 3.8 OTA（Over-The-Air）空中升级

OTA允许通过WiFi无线更新固件，无需USB连接：

**优势**：
- 无需物理接触设备
- 可远程批量升级
- 适合已部署的设备维护

**实现方式**：
1. **ArduinoOTA**：局域网内通过Arduino IDE升级
2. **HTTP OTA**：从服务器下载固件升级
3. **HTTPS OTA**：加密传输，更安全

## 💻 代码示例（40%）

### 示例1：ESP32 WiFi连接基础

**功能**：连接WiFi并在串口显示IP地址。

```cpp
// 示例1：ESP32 WiFi连接基础
// 连接WiFi并显示IP地址

#include <WiFi.h>  // 引入WiFi库

// WiFi配置（修改为你的网络信息）
const char* ssid = "你的WiFi名称";        // WiFi名称
const char* password = "你的WiFi密码";    // WiFi密码

void setup() {
  Serial.begin(115200);  // ESP32常用波特率115200
  delay(1000);           // 等待串口稳定
  
  Serial.println();
  Serial.println("=== ESP32 WiFi连接测试 ===");
  
  // 开始连接WiFi
  Serial.print("正在连接WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);  // 启动WiFi连接
  
  // 等待连接，最多尝试20秒
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);           // 每秒检查一次
    Serial.print(".");
    attempts++;
  }
  
  // 检查连接结果
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi连接成功！");
    Serial.print("IP地址: ");
    Serial.println(WiFi.localIP());        // 显示获取到的IP
    Serial.print("信号强度: ");
    Serial.print(WiFi.RSSI());            // 信号强度（dBm）
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("WiFi连接失败！请检查配置。");
  }
}

void loop() {
  // 每5秒检查一次连接状态
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi连接正常");
  } else {
    Serial.println("WiFi已断开，尝试重连...");
    WiFi.reconnect();  // 尝试重连
  }
  delay(5000);
}
```

### 示例2：WiFi断线自动重连

**功能**：检测WiFi断线并自动重连，带事件回调。

```cpp
// 示例2：WiFi断线自动重连
// 使用事件系统处理WiFi状态变化

#include <WiFi.h>

const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";

// WiFi事件回调函数
void WiFiEvent(WiFiEvent_t event) {
  switch (event) {
    case ARDUINO_EVENT_WIFI_STA_START:
      Serial.println("WiFi STA模式启动");
      break;
      
    case ARDUINO_EVENT_WIFI_STA_CONNECTED:
      Serial.println("已连接到WiFi热点");
      break;
      
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.print("获取到IP地址: ");
      Serial.println(WiFi.localIP());
      break;
      
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("WiFi连接断开！");
      Serial.println("5秒后尝试重连...");
      delay(5000);
      WiFi.begin(ssid, password);  // 自动重连
      break;
      
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  // 注册WiFi事件回调
  WiFi.onEvent(WiFiEvent);
  
  // 设置WiFi模式为STA
  WiFi.mode(WIFI_STA);
  
  // 开始连接
  Serial.println("正在连接WiFi...");
  WiFi.begin(ssid, password);
}

void loop() {
  // 主循环可以处理其他任务
  // WiFi重连由事件系统自动处理
  
  // 显示当前状态（每10秒）
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 10000) {
    lastCheck = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("信号强度: ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");
    }
  }
}
```

### 示例3：BLE扫描示例

**功能**：扫描周围的BLE设备并显示信息。

```cpp
// 示例3：BLE设备扫描
// 扫描并显示周围的BLE设备

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

int scanTime = 5;  // 扫描时间（秒）
BLEScan* pBLEScan;

// 扫描回调类
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.println("=== 发现BLE设备 ===");
    
    // 显示设备名称
    if (advertisedDevice.haveName()) {
      Serial.print("设备名称: ");
      Serial.println(advertisedDevice.getName().c_str());
    } else {
      Serial.println("设备名称: (未知)");
    }
    
    // 显示MAC地址
    Serial.print("MAC地址: ");
    Serial.println(advertisedDevice.getAddress().toString().c_str());
    
    // 显示信号强度
    Serial.print("信号强度: ");
    Serial.print(advertisedDevice.getRSSI());
    Serial.println(" dBm");
    
    // 显示UUID（如果有）
    if (advertisedDevice.haveServiceUUID()) {
      Serial.print("服务UUID: ");
      Serial.println(advertisedDevice.getServiceUUID().toString().c_str());
    }
    
    Serial.println();
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 BLE扫描器 ===");
  
  // 初始化BLE
  BLEDevice::init("");
  
  // 创建扫描对象
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);  // 主动扫描，获取更多信息
  pBLEScan->setInterval(100);     // 扫描间隔
  pBLEScan->setWindow(99);        // 扫描窗口
}

void loop() {
  Serial.println("开始扫描BLE设备...");
  
  // 执行扫描
  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
  
  Serial.print("扫描完成，发现 ");
  Serial.print(foundDevices.getCount());
  Serial.println(" 个设备");
  Serial.println();
  
  // 清除扫描结果，准备下次扫描
  pBLEScan->clearResults();
  
  delay(5000);  // 等待5秒后再次扫描
}
```

## 🔧 实操项目（20%）

### 项目3.1：ESP32连接WiFi并获取网络时间（NTP）

**目标**：通过NTP服务器获取精确的网络时间，并在串口显示。

**材料**：
- ESP32开发板 × 1
- USB数据线 × 1
- WiFi网络

**原理**：NTP（Network Time Protocol）是网络时间协议，可从时间服务器获取精确时间。

```cpp
// 项目3.1：ESP32 NTP网络时间同步
// 从NTP服务器获取当前时间并显示

#include <WiFi.h>
#include <time.h>

// WiFi配置
const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";

// NTP服务器配置
const char* ntpServer = "pool.ntp.org";  // NTP服务器地址
const long gmtOffset_sec = 8 * 3600;     // 时区偏移（中国为UTC+8）
const int daylightOffset_sec = 0;        // 夏令时偏移（中国不使用）

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 NTP时间同步示例 ===");
  
  // 连接WiFi
  Serial.print("正在连接WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi连接成功！");
  Serial.print("IP地址: ");
  Serial.println(WiFi.localIP());
  
  // 配置NTP
  Serial.println("正在从NTP服务器获取时间...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // 等待时间同步
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("获取时间失败！");
    return;
  }
  
  Serial.println("时间同步成功！");
  Serial.println();
}

void loop() {
  // 获取当前时间
  struct tm timeinfo;
  
  if (!getLocalTime(&timeinfo)) {
    Serial.println("获取时间失败");
    delay(1000);
    return;
  }
  
  // 格式化输出时间
  Serial.println("=== 当前时间 ===");
  
  // 日期
  Serial.print("日期: ");
  Serial.print(timeinfo.tm_year + 1900);  // 年份需要加1900
  Serial.print("年");
  Serial.print(timeinfo.tm_mon + 1);      // 月份从0开始，需要加1
  Serial.print("月");
  Serial.print(timeinfo.tm_mday);         // 日
  Serial.println("日");
  
  // 时间
  Serial.print("时间: ");
  Serial.print(timeinfo.tm_hour);         // 时
  Serial.print(":");
  if (timeinfo.tm_min < 10) Serial.print("0");  // 分钟补零
  Serial.print(timeinfo.tm_min);
  Serial.print(":");
  if (timeinfo.tm_sec < 10) Serial.print("0");  // 秒补零
  Serial.print(timeinfo.tm_sec);
  Serial.println();
  
  // 星期
  const char* weekDays[] = {"日", "一", "二", "三", "四", "五", "六"};
  Serial.print("星期: ");
  Serial.println(weekDays[timeinfo.tm_wday]);
  
  // Unix时间戳
  Serial.print("Unix时间戳: ");
  Serial.println(mktime(&timeinfo));
  
  Serial.println();
  
  delay(1000);  // 每秒更新
}
```

**运行效果**：
```
=== 当前时间 ===
日期: 2025年4月21日
时间: 14:30:25
星期: 一
Unix时间戳: 1745232625
```

### 项目3.2：ESP32 Web服务器——浏览器远程控制LED

**目标**：搭建Web服务器，通过浏览器控制ESP32上的LED开关。

**材料**：
- ESP32开发板 × 1
- LED × 1
- 220Ω电阻 × 1
- 面包板和跳线

**接线**：
- LED：GPIO2 → 220Ω电阻 → LED正极 → LED负极 → GND

```cpp
// 项目3.2：ESP32 Web服务器控制LED
// 通过浏览器远程控制LED开关

#include <WiFi.h>
#include <WebServer.h>

// WiFi配置
const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";

// LED引脚
const int ledPin = 2;  // ESP32板载LED通常在GPIO2

// 创建Web服务器对象，端口80
WebServer server(80);

// LED状态
bool ledState = false;

// HTML网页内容
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>ESP32 LED控制</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      background: white;
      border-radius: 15px;
      padding: 30px;
      max-width: 400px;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    .status {
      font-size: 24px;
      margin: 20px 0;
      padding: 15px;
      border-radius: 10px;
    }
    .on {
      background: #4CAF50;
      color: white;
    }
    .off {
      background: #f44336;
      color: white;
    }
    button {
      background: #2196F3;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 18px;
      border-radius: 25px;
      cursor: pointer;
      margin: 10px;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
    button:active {
      transform: scale(0.95);
    }
    .info {
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class='container'>
    <h1>💡 ESP32 LED控制</h1>
    <div class='status %CLASS%'>
      LED当前状态: %STATE%
    </div>
    <a href='/on'><button>开启LED</button></a>
    <a href='/off'><button>关闭LED</button></a>
    <div class='info'>
      ESP32 IP地址: %IP%
    </div>
  </div>
</body>
</html>
)rawliteral";

// 处理根路径请求
void handleRoot() {
  // 替换HTML中的占位符
  String html = htmlPage;
  html.replace("%CLASS%", ledState ? "on" : "off");
  html.replace("%STATE%", ledState ? "开启" : "关闭");
  html.replace("%IP%", WiFi.localIP().toString());
  
  server.send(200, "text/html", html);
}

// 处理开启LED请求
void handleOn() {
  ledState = true;
  digitalWrite(ledPin, HIGH);
  Serial.println("LED已开启");
  server.sendHeader("Location", "/");  // 重定向到首页
  server.send(303);
}

// 处理关闭LED请求
void handleOff() {
  ledState = false;
  digitalWrite(ledPin, LOW);
  Serial.println("LED已关闭");
  server.sendHeader("Location", "/");  // 重定向到首页
  server.send(303);
}

// 处理404错误
void handleNotFound() {
  server.send(404, "text/plain", "404 - 页面未找到");
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 Web服务器 LED控制 ===");
  
  // 初始化LED引脚
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // 连接WiFi
  Serial.print("正在连接WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi连接成功！");
  Serial.print("Web服务器地址: http://");
  Serial.println(WiFi.localIP());
  
  // 设置Web服务器路由
  server.on("/", handleRoot);        // 首页
  server.on("/on", handleOn);        // 开启LED
  server.on("/off", handleOff);      // 关闭LED
  server.onNotFound(handleNotFound); // 404处理
  
  // 启动Web服务器
  server.begin();
  Serial.println("Web服务器已启动");
  Serial.println("请在浏览器中访问上述IP地址");
}

void loop() {
  // 处理客户端请求
  server.handleClient();
  delay(2);  // 短暂延迟，避免CPU占用过高
}
```

**使用方法**：
1. 上传代码到ESP32
2. 打开串口监视器，查看获取到的IP地址
3. 在同一WiFi网络的手机/电脑浏览器中输入该IP地址
4. 点击按钮控制LED开关

### 项目3.3：ESP32蓝牙串口透传（BLE UART）

**目标**：实现BLE串口透传功能，手机可与ESP32双向通信。

**材料**：
- ESP32开发板 × 1
- 手机（安装BLE调试APP，如"nRF Connect"）

```cpp
// 项目3.3：ESP32 BLE串口透传
// 实现手机与ESP32的双向蓝牙通信

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// BLE服务和特征UUID（标准UART UUID）
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

// BLE对象
BLEServer* pServer = NULL;
BLEService* pService = NULL;
BLECharacteristic* pTxCharacteristic = NULL;
BLECharacteristic* pRxCharacteristic = NULL;

// 连接状态
bool deviceConnected = false;
bool oldDeviceConnected = false;

// 数据接收缓冲区
String rxBuffer = "";

// 服务器回调类
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE设备已连接");
  }
  
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE设备已断开");
  }
};

// 特征回调类（接收手机发来的数据）
class MyRxCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    // 获取手机发来的数据
    String rxValue = pCharacteristic->getValue();
    
    if (rxValue.length() > 0) {
      Serial.print("收到BLE数据: ");
      Serial.println(rxValue.c_str());
      
      // 处理收到的命令
      processCommand(rxValue);
    }
  }
};

// 处理收到的命令
void processCommand(String command) {
  command.trim();  // 去除首尾空白
  
  if (command == "LED_ON") {
    digitalWrite(2, HIGH);
    sendBLEData("LED已开启");
    Serial.println("执行命令: LED开启");
  } 
  else if (command == "LED_OFF") {
    digitalWrite(2, LOW);
    sendBLEData("LED已关闭");
    Serial.println("执行命令: LED关闭");
  }
  else if (command == "STATUS") {
    int ledStatus = digitalRead(2);
    String status = "LED状态: " + String(ledStatus ? "开启" : "关闭");
    sendBLEData(status);
  }
  else if (command == "HELLO") {
    sendBLEData("你好！我是ESP32");
  }
  else {
    // 回显收到的数据
    sendBLEData("回显: " + command);
  }
}

// 发送数据到手机
void sendBLEData(String data) {
  if (deviceConnected) {
    pTxCharacteristic->setValue(data.c_str());
    pTxCharacteristic->notify();  // 发送通知
    Serial.print("发送BLE数据: ");
    Serial.println(data);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32 BLE串口透传 ===");
  
  // 初始化LED引脚
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  // 初始化BLE设备
  BLEDevice::init("ESP32-BLE-UART");  // 设置BLE设备名称
  
  // 创建BLE服务器
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // 创建BLE服务
  pService = pServer->createService(SERVICE_UUID);
  
  // 创建TX特征（发送数据到手机）
  pTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());
  
  // 创建RX特征（接收手机数据）
  pRxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE
  );
  pRxCharacteristic->setCallbacks(new MyRxCallbacks());
  
  // 启动服务
  pService->start();
  
  // 开始广播
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE服务已启动");
  Serial.println("设备名称: ESP32-BLE-UART");
  Serial.println("等待手机连接...");
  Serial.println();
  Serial.println("支持的命令:");
  Serial.println("  LED_ON  - 开启LED");
  Serial.println("  LED_OFF - 关闭LED");
  Serial.println("  STATUS  - 查询状态");
  Serial.println("  HELLO   - 打招呼");
}

void loop() {
  // 处理连接状态变化
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);  // 给蓝牙栈时间处理
    pServer->startAdvertising();  // 重新开始广播
    Serial.println("重新开始广播...");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  // 可以在这里发送周期性数据
  static unsigned long lastSend = 0;
  if (deviceConnected && millis() - lastSend > 5000) {
    lastSend = millis();
    
    // 发送ESP32运行时间
    String uptime = "运行时间: " + String(millis() / 1000) + "秒";
    sendBLEData(uptime);
  }
  
  delay(100);
}
```

**手机端使用方法**：
1. 安装BLE调试APP（推荐"nRF Connect"）
2. 扫描并连接"ESP32-BLE-UART"
3. 找到UART服务的RX特征
4. 写入命令（如"LED_ON"）
5. 在TX特征上可收到ESP32的回复

## 🔍 调试技巧（10%）

### WiFi连接问题排查

**常见问题1：连接超时**
```cpp
// 增加超时时间
WiFi.begin(ssid, password);
int timeout = 30;  // 30秒超时
while (WiFi.status() != WL_CONNECTED && timeout > 0) {
  delay(1000);
  Serial.print(".");
  timeout--;
}

if (timeout == 0) {
  Serial.println("连接超时！检查WiFi名称和密码。");
}
```

**常见问题2：连接不稳定**
```cpp
// 使用事件处理重连
WiFi.onEvent([](WiFiEvent_t event, WiFiEventInfo_t info) {
  if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
    Serial.println("WiFi断开，自动重连...");
    WiFi.begin(ssid, password);
  }
});
```

### BLE连接问题排查

**常见问题：手机搜索不到设备**
1. 检查设备名称是否正确
2. 确认广播已启动
3. 检查UUID格式是否正确
4. 尝试重启ESP32和手机蓝牙

### 串口调试技巧

```cpp
// 调试宏定义
#define DEBUG true

#if DEBUG
  #define DBG_PRINT(x) Serial.print(x)
  #define DBG_PRINTLN(x) Serial.println(x)
#else
  #define DBG_PRINT(x)
  #define DBG_PRINTLN(x)
#endif

void loop() {
  DBG_PRINT("当前状态: ");
  DBG_PRINTLN(status);
}
```

## 📚 总结与扩展

### 本章要点回顾

1. **ESP32优势**：32位双核240MHz，内置WiFi蓝牙，520KB SRAM
2. **WiFi功能**：支持STA/AP模式，可自动重连
3. **BLE蓝牙**：低功耗，适合物联网设备通信
4. **Web服务器**：可搭建控制界面，实现远程控制
5. **NTP时间**：可从网络获取精确时间
6. **开发板选择**：初学选DevKitC，AI选S3，低功耗选C3

### 扩展思考

1. **如何实现手机APP控制ESP32？**
   - 提示：可使用MIT App Inventor开发简单APP
   - 或使用Blynk、MQTT等物联网平台

2. **如何将传感器数据上传到云端？**
   - 提示：使用HTTP POST请求或MQTT协议
   - 可对接阿里云、腾讯云等平台

3. **如何实现ESP32之间的通信？**
   - 提示：可使用ESP-NOW协议（无需路由器）
   - 或通过MQTT服务器中转

4. **如何实现HTTPS安全连接？**
   - 提示：使用WiFiClientSecure类
   - 需要配置SSL证书

### 下一步学习

第4章我们将学习：
- ESP32摄像头应用（ESP32-CAM）
- 语音识别与合成
- 机器学习边缘推理
- 与AI大模型的结合

## 📖 参考资源

1. ESP32官方文档：https://docs.espressif.com/projects/esp-idf/zh_CN/latest/esp32/
2. ESP32 Arduino库文档：https://espressif-docs.readthedocs-hosted.com/projects/arduino-esp32/en/latest/
3. Random Nerd Tutorials：https://randomnerdtutorials.com/esp32-web-server-arduino-ide/
4. 微雪电子ESP32教程：https://docs.waveshare.net/ESP32-Arduino-Tutorials/
5. ESP32 BLE开发指南：https://github.com/nkolban/esp32-snippets

---

*本教程基于Arduino IDE 2.x和ESP32 Arduino Core 2.x编写。代码已在ESP32-DevKitC和ESP32-S3-DevKitC-1上测试通过。*

*更新日期：2025年4月*