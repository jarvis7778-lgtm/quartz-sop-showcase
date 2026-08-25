# 第6章 MQTT协议与物联网通信

## 学习目标

通过本章学习，您将能够：
1. 理解MQTT协议的核心原理和工作机制
2. 掌握PubSubClient库的使用方法
3. 使用公共MQTT Broker（broker.emqx.io）进行设备通信
4. 设计合理的JSON消息格式
5. 实现MQTT安全通信（TLS/SSL）
6. 完成四个实操项目：基础通信、传感器数据上传、远程控制、调试工具使用

## 1. MQTT协议基础

### 1.1 什么是MQTT？

MQTT（Message Queuing Telemetry Transport，消息队列遥测传输）是一种轻量级的发布/订阅消息传输协议，专为低带宽、高延迟或不可靠的网络环境设计。MQTT协议由IBM的Andy Stanford-Clark博士和Arcom（现为Eurotech）的Arlen Nipper于1999年发明，现已成为物联网通信的事实标准。

### 1.2 MQTT核心特点

1. **轻量级**：协议头最小只有2字节，适合资源受限的设备
2. **发布/订阅模式**：解耦消息生产者和消费者
3. **支持三种服务质量（QoS）**：
   - QoS 0：最多交付一次（Fire and Forget）
   - QoS 1：至少交付一次（Acknowledged Delivery）
   - QoS 2：确保交付一次（Assured Delivery）
4. **遗嘱消息（Last Will）**：设备异常断开时自动发送通知
5. **保留消息（Retained Message）**：新订阅者立即获取最新状态
6. **心跳机制（Keep Alive）**：维持连接活性

### 1.3 MQTT架构组件

1. **Broker（代理服务器）**：消息中转站，负责消息路由
2. **Client（客户端）**：发布或订阅消息的设备或应用程序
3. **Topic（主题）**：消息的分类标签，支持层级结构
4. **Message（消息）**：实际传输的数据内容

### 1.4 Topic设计规范

MQTT Topic采用层级结构，使用斜杠（/）分隔：

```
home/room1/temperature    # 房间1温度
home/room1/humidity       # 房间1湿度
home/room1/light          # 房间1灯光控制
device/esp32/status       # ESP32设备状态
sensor/dht22/data         # DHT22传感器数据
```

**Topic设计原则：**
- 使用有意义的层级结构
- 避免使用通配符（+和#）在发布时
- 保持Topic简洁但具有描述性
- 考虑安全性，避免暴露敏感信息

## 2. PubSubClient库详解

### 2.1 库安装

在Arduino IDE中安装PubSubClient库：
1. 打开Arduino IDE
2. 点击"工具" → "管理库..."
3. 搜索"PubSubClient"
4. 点击"安装"

### 2.2 核心API

```cpp
// 主要类和函数
PubSubClient client;  // 创建MQTT客户端对象
client.setServer(server, port);  // 设置MQTT服务器
client.setCallback(callback);    // 设置消息回调函数
client.connect(clientId, username, password);  // 连接MQTT服务器
client.publish(topic, payload);  // 发布消息
client.subscribe(topic);         // 订阅主题
client.loop();                   // 处理MQTT消息和维持连接
client.connected();              // 检查连接状态
client.disconnect();             // 断开连接
```

### 2.3 回调函数

```cpp
void callback(char* topic, byte* payload, unsigned int length) {
  // topic: 收到消息的主题
  // payload: 消息内容（字节数组）
  // length: 消息长度
}
```

## 3. 公共MQTT Broker

### 3.1 EMQX公共Broker

EMQX提供免费的公共MQTT Broker用于测试和学习：

- **服务器地址**：`broker.emqx.io`
- **TCP端口**：`1883`（非加密）
- **SSL/TLS端口**：`8883`（加密）
- **WebSocket端口**：`8083`
- **WebSocket Secure端口**：`8084`
- **用户名**：`emqx`
- **密码**：`public`

### 3.2 其他公共Broker

1. **HiveMQ**：`broker.hivemq.com:1883`
2. **Mosquitto**：`test.mosquitto.org:1883`
3. **MQTT.cool**：`broker.mqtt.cool:1883`

## 4. JSON消息格式设计

### 4.1 为什么使用JSON？

JSON（JavaScript Object Notation）是物联网通信中常用的数据格式：
- 人类可读且易于解析
- 轻量级，适合低带宽环境
- 支持复杂数据结构
- 跨语言兼容性好

### 4.2 使用ArduinoJson库

```cpp
#include <ArduinoJson.h>

// 创建JSON文档
StaticJsonDocument<200> doc;

// 添加数据
doc["temperature"] = 25.5;
doc["humidity"] = 60;
doc["device"] = "ESP32";
doc["timestamp"] = millis();

// 序列化为字符串
char buffer[256];
serializeJson(doc, buffer, sizeof(buffer));

// 发布JSON消息
client.publish("sensor/data", buffer);
```

### 4.3 解析JSON消息

```cpp
void callback(char* topic, byte* payload, unsigned int length) {
  // 将payload转换为字符串
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  
  // 解析JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (!error) {
    float temp = doc["temperature"];
    int hum = doc["humidity"];
    Serial.printf("温度: %.1f, 湿度: %d%%\n", temp, hum);
  }
}
```

## 5. MQTT安全（TLS/SSL）

### 5.1 为什么需要MQTT安全？

1. **数据隐私**：防止敏感数据被窃听
2. **身份验证**：确保设备身份合法
3. **数据完整性**：防止数据被篡改
4. **访问控制**：限制未授权访问

### 5.2 TLS/SSL配置

```cpp
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// CA证书（EMQX公共Broker的CA证书）
const char* ca_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDxTCCAq2gAwIBAgIBADANBgkqhkiG9w0BAQsFADCBgzELMAkGA1UEBhMCVVMx\n" \
"...（省略中间内容）...\n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  // 设置CA证书
  espClient.setCACert(ca_cert);
  
  // 设置MQTT服务器（使用SSL端口）
  client.setServer("broker.emqx.io", 8883);
}
```

## 6. 实操项目

### 项目6.1：ESP32连接EMQX收发消息

**项目目标**：建立ESP32与MQTT Broker的基础连接，实现消息的发布和订阅。

**所需硬件**：
- ESP32开发板 × 1
- USB数据线 × 1

**电路连接**：仅需USB连接电脑

**完整代码**：

```cpp
/*
 * 项目6.1：ESP32连接EMQX收发消息
 * 功能：连接WiFi和MQTT服务器，实现消息发布和订阅
 * 作者：AIoT教程
 */

#include <WiFi.h>           // ESP32 WiFi库
#include <PubSubClient.h>   // MQTT客户端库

// ==================== 配置信息 ====================
// WiFi配置
const char* ssid = "your_wifi_ssid";           // WiFi名称
const char* password = "your_wifi_password";   // WiFi密码

// MQTT服务器配置
const char* mqtt_server = "broker.emqx.io";   // MQTT服务器地址
const int mqtt_port = 1883;                    // MQTT端口
const char* mqtt_user = "emqx";                // MQTT用户名
const char* mqtt_pass = "public";              // MQTT密码

// Topic配置
const char* pub_topic = "esp32/test/message";   // 发布主题
const char* sub_topic = "esp32/test/command";   // 订阅主题

// ==================== 全局对象 ====================
WiFiClient espClient;          // WiFi客户端
PubSubClient mqttClient(espClient);  // MQTT客户端

// 定时器变量
unsigned long lastMsg = 0;     // 上次发送消息时间
const long interval = 5000;    // 发送间隔（毫秒）
int messageCount = 0;          // 消息计数器

// ==================== 函数定义 ====================

/**
 * WiFi连接函数
 * 尝试连接WiFi网络，直到连接成功
 */
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("正在连接WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);  // 开始连接WiFi

  // 等待WiFi连接
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi连接成功！");
  Serial.print("IP地址: ");
  Serial.println(WiFi.localIP());
}

/**
 * MQTT消息回调函数
 * 当收到订阅主题的消息时被调用
 * @param topic 收到消息的主题
 * @param payload 消息内容
 * @param length 消息长度
 */
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("收到消息 [");
  Serial.print(topic);
  Serial.print("]: ");
  
  // 将payload转换为字符串
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // 根据消息内容执行相应操作
  if (message == "LED_ON") {
    Serial.println("→ 执行：打开LED");
    digitalWrite(2, HIGH);  // ESP32板载LED
  } else if (message == "LED_OFF") {
    Serial.println("→ 执行：关闭LED");
    digitalWrite(2, LOW);
  } else if (message == "STATUS") {
    // 回复设备状态
    String status = "设备在线，运行时间：" + String(millis()/1000) + "秒";
    mqttClient.publish(pub_topic, status.c_str());
  }
}

/**
 * MQTT重连函数
 * 当连接断开时尝试重新连接
 */
void mqtt_reconnect() {
  // 循环直到连接成功
  while (!mqttClient.connected()) {
    Serial.print("正在连接MQTT服务器...");
    
    // 生成随机客户端ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // 尝试连接
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("连接成功！");
      
      // 发布上线消息
      String onlineMsg = "设备 " + clientId + " 已上线";
      mqttClient.publish(pub_topic, onlineMsg.c_str());
      
      // 订阅命令主题
      mqttClient.subscribe(sub_topic);
      Serial.print("已订阅主题: ");
      Serial.println(sub_topic);
    } else {
      Serial.print("连接失败，错误码: ");
      Serial.print(mqttClient.state());
      Serial.println("，5秒后重试...");
      delay(5000);
    }
  }
}

/**
 * 初始化函数
 */
void setup() {
  // 初始化串口
  Serial.begin(115200);
  Serial.println("\n=== ESP32 MQTT 基础示例 ===");
  
  // 初始化板载LED引脚
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  // 连接WiFi
  setup_wifi();
  
  // 配置MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqtt_callback);
  
  // 设置缓冲区大小
  mqttClient.setBufferSize(512);
}

/**
 * 主循环函数
 */
void loop() {
  // 检查MQTT连接
  if (!mqttClient.connected()) {
    mqtt_reconnect();
  }
  
  // 处理MQTT消息
  mqttClient.loop();
  
  // 定时发送消息
  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    messageCount++;
    
    // 构建消息内容
    String message = "心跳消息 #" + String(messageCount);
    message += " | 运行时间: " + String(now/1000) + "秒";
    
    // 发布消息
    Serial.print("发送消息: ");
    Serial.println(message);
    mqttClient.publish(pub_topic, message.c_str());
  }
}
```

### 项目6.2：ESP32+DHT22上传温湿度到MQTT

**项目目标**：使用DHT22传感器采集温湿度数据，通过MQTT上传到服务器。

**所需硬件**：
- ESP32开发板 × 1
- DHT22温湿度传感器 × 1
- 10kΩ电阻 × 1（上拉电阻）
- 面包板 × 1
- 杜邦线若干

**电路连接**：
```
DHT22        ESP32
VCC    →    3.3V
DATA   →    GPIO4（通过10kΩ上拉到VCC）
NC     →    不连接
GND    →    GND
```

**完整代码**：

```cpp
/*
 * 项目6.2：ESP32+DHT22上传温湿度到MQTT
 * 功能：采集DHT22温湿度数据，通过MQTT上传，使用JSON格式
 * 作者：AIoT教程
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>           // DHT传感器库
#include <ArduinoJson.h>   // JSON处理库

// ==================== 硬件配置 ====================
#define DHTPIN 4           // DHT22数据引脚
#define DHTTYPE DHT22      // DHT传感器类型

DHT dht(DHTPIN, DHTTYPE); // 创建DHT对象

// ==================== 网络配置 ====================
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// ==================== MQTT配置 ====================
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "emqx";
const char* mqtt_pass = "public";

// Topic定义
const char* topic_sensor = "home/sensor/dht22";      // 传感器数据
const char* topic_status = "home/sensor/status";     // 设备状态
const char* topic_config = "home/sensor/config";     // 配置主题

// ==================== 全局变量 ====================
WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastRead = 0;
unsigned long lastPublish = 0;
const long readInterval = 2000;    // 读取间隔2秒
const long publishInterval = 10000; // 发布间隔10秒

// 传感器数据
float temperature = 0;
float humidity = 0;
int readCount = 0;
int publishCount = 0;

// ==================== 函数定义 ====================

/**
 * 读取DHT22传感器数据
 * @return true-读取成功，false-读取失败
 */
bool readDHT() {
  // 读取湿度
  float h = dht.readHumidity();
  // 读取温度（摄氏度）
  float t = dht.readTemperature();
  
  // 检查读取是否成功
  if (isnan(h) || isnan(t)) {
    Serial.println("⚠️ 读取DHT传感器失败！");
    return false;
  }
  
  // 计算热指数
  float hic = dht.computeHeatIndex(t, h, false);
  
  // 更新全局变量
  temperature = t;
  humidity = h;
  readCount++;
  
  Serial.printf("📊 读取成功 #%d: 温度=%.1f°C, 湿度=%.1f%%, 热指数=%.1f°C\n", 
                readCount, temperature, humidity, hic);
  return true;
}

/**
 * 发布传感器数据（JSON格式）
 */
void publishSensorData() {
  // 创建JSON文档
  StaticJsonDocument<256> doc;
  
  // 填充数据
  doc["device"] = "ESP32-DHT22";
  doc["temperature"] = round(temperature * 10) / 10.0;  // 保留1位小数
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["heat_index"] = round(dht.computeHeatIndex(temperature, humidity, false) * 10) / 10.0;
  doc["read_count"] = readCount;
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  
  // 序列化为字符串
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));
  
  // 发布消息
  if (mqttClient.publish(topic_sensor, jsonBuffer)) {
    Serial.println("✅ 数据发布成功！");
    publishCount++;
  } else {
    Serial.println("❌ 数据发布失败！");
  }
}

/**
 * 发布设备状态
 */
void publishStatus() {
  StaticJsonDocument<200> doc;
  
  doc["device_id"] = WiFi.macAddress();
  doc["ip"] = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();
  doc["uptime"] = millis() / 1000;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["read_count"] = readCount;
  doc["publish_count"] = publishCount;
  
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));
  
  mqttClient.publish(topic_status, jsonBuffer);
  Serial.println("📤 状态信息已发布");
}

/**
 * MQTT回调函数
 */
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📩 收到消息 [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // 处理配置命令
  if (String(topic) == topic_config) {
    StaticJsonDocument<100> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      if (doc.containsKey("publish_interval")) {
        // 可以动态修改发布间隔
        Serial.println("⚙️ 收到配置更新");
      }
    }
  }
}

/**
 * WiFi连接
 */
void setup_wifi() {
  Serial.print("📶 正在连接WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println(" 连接成功！");
  Serial.print("📍 IP地址: ");
  Serial.println(WiFi.localIP());
}

/**
 * MQTT连接
 */
void mqtt_reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("🔗 正在连接MQTT...");
    
    String clientId = "ESP32-DHT22-" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println(" 连接成功！");
      
      // 订阅配置主题
      mqttClient.subscribe(topic_config);
      
      // 发布上线消息
      publishStatus();
    } else {
      Serial.print(" 失败，rc=");
      Serial.print(mqttClient.state());
      Serial.println("，5秒后重试...");
      delay(5000);
    }
  }
}

/**
 * 初始化
 */
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 + DHT22 温湿度监测系统 ===");
  
  // 初始化DHT传感器
  dht.begin();
  Serial.println("🌡️ DHT22传感器已初始化");
  
  // 连接WiFi
  setup_wifi();
  
  // 配置MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqtt_callback);
  mqttClient.setBufferSize(512);
}

/**
 * 主循环
 */
void loop() {
  // 保持MQTT连接
  if (!mqttClient.connected()) {
    mqtt_reconnect();
  }
  mqttClient.loop();
  
  unsigned long now = millis();
  
  // 定时读取传感器
  if (now - lastRead > readInterval) {
    lastRead = now;
    readDHT();
  }
  
  // 定时发布数据
  if (now - lastPublish > publishInterval) {
    lastPublish = now;
    if (temperature != 0 || humidity != 0) {  // 确保有数据
      publishSensorData();
    }
  }
}
```

### 项目6.3：MQTT远程控制继电器

**项目目标**：通过MQTT消息远程控制继电器，实现智能家居控制。

**所需硬件**：
- ESP32开发板 × 1
- 5V继电器模块 × 1
- LED灯泡（或台灯）× 1
- 面包板 × 1
- 杜邦线若干

**电路连接**：
```
继电器模块      ESP32
VCC      →    5V（或3.3V，取决于继电器）
GND      →    GND
IN       →    GPIO5

负载连接（以LED为例）：
继电器NO    →    LED正极
LED负极     →    150Ω电阻 → GND
```

**安全提示**：
- 继电器控制高压设备时，请确保断电操作
- 高压部分请专业电工接线
- 注意继电器的负载能力

**完整代码**：

```cpp
/*
 * 项目6.3：MQTT远程控制继电器
 * 功能：通过MQTT控制继电器，支持多路控制和状态反馈
 * 作者：AIoT教程
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==================== 硬件配置 ====================
#define RELAY1_PIN 5       // 继电器1控制引脚
#define RELAY2_PIN 18      // 继电器2控制引脚（可选）
#define LED_PIN 2          // 板载LED指示灯

// ==================== 网络配置 ====================
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// ==================== MQTT配置 ====================
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "emqx";
const char* mqtt_pass = "public";

// Topic定义
const char* topic_control = "home/relay/control";   // 控制命令
const char* topic_status = "home/relay/status";     // 状态上报
const char* topic_ack = "home/relay/ack";           // 操作确认

// ==================== 全局变量 ====================
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// 继电器状态
bool relay1State = false;
bool relay2State = false;

// 定时器
unsigned long lastStatus = 0;
const long statusInterval = 30000;  // 30秒上报一次状态

// ==================== 函数定义 ====================

/**
 * 控制继电器
 * @param relay 继电器编号（1或2）
 * @param state 目标状态（true=开，false=关）
 */
void controlRelay(int relay, bool state) {
  switch (relay) {
    case 1:
      relay1State = state;
      digitalWrite(RELAY1_PIN, state ? HIGH : LOW);
      Serial.printf("🔌 继电器1: %s\n", state ? "开启" : "关闭");
      break;
    case 2:
      relay2State = state;
      digitalWrite(RELAY2_PIN, state ? HIGH : LOW);
      Serial.printf("🔌 继电器2: %s\n", state ? "开启" : "关闭");
      break;
  }
  
  // 更新板载LED状态（任一继电器开则亮）
  digitalWrite(LED_PIN, (relay1State || relay2State) ? HIGH : LOW);
  
  // 发送操作确认
  StaticJsonDocument<100> ack;
  ack["relay"] = relay;
  ack["state"] = state;
  ack["timestamp"] = millis();
  
  char buffer[100];
  serializeJson(ack, buffer);
  mqttClient.publish(topic_ack, buffer);
}

/**
 * 发布当前状态
 */
void publishStatus() {
  StaticJsonDocument<200> doc;
  
  doc["device"] = "ESP32-Relay";
  doc["relay1"] = relay1State;
  doc["relay2"] = relay2State;
  doc["uptime"] = millis() / 1000;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["rssi"] = WiFi.RSSI();
  
  char buffer[200];
  serializeJson(doc, buffer);
  
  mqttClient.publish(topic_status, buffer);
  Serial.println("📤 状态已上报");
}

/**
 * 解析并执行控制命令
 * @param message JSON格式的控制命令
 */
void processCommand(String message) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.print("❌ JSON解析失败: ");
    Serial.println(error.c_str());
    return;
  }
  
  // 处理单继电器控制
  if (doc.containsKey("relay") && doc.containsKey("state")) {
    int relay = doc["relay"];
    bool state = doc["state"];
    
    if (relay == 1 || relay == 2) {
      controlRelay(relay, state);
    } else {
      Serial.println("⚠️ 无效的继电器编号");
    }
  }
  
  // 处理多继电器控制
  if (doc.containsKey("relays")) {
    JsonObject relays = doc["relays"];
    
    if (relays.containsKey("relay1")) {
      controlRelay(1, relays["relay1"]);
    }
    if (relays.containsKey("relay2")) {
      controlRelay(2, relays["relay2"]);
    }
  }
  
  // 处理开关所有继电器
  if (doc.containsKey("all")) {
    bool state = doc["all"];
    controlRelay(1, state);
    controlRelay(2, state);
  }
  
  // 处理状态查询
  if (doc.containsKey("query") && doc["query"] == "status") {
    publishStatus();
  }
}

/**
 * MQTT回调函数
 */
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📩 收到命令 [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // 执行控制命令
  processCommand(message);
}

/**
 * WiFi连接
 */
void setup_wifi() {
  Serial.print("📶 连接WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println(" 成功！");
  Serial.print("📍 IP: ");
  Serial.println(WiFi.localIP());
}

/**
 * MQTT连接
 */
void mqtt_reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("🔗 连接MQTT...");
    
    String clientId = "ESP32-Relay-" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println(" 成功！");
      
      // 订阅控制主题
      mqttClient.subscribe(topic_control);
      Serial.print("📥 已订阅: ");
      Serial.println(topic_control);
      
      // 发布初始状态
      publishStatus();
    } else {
      Serial.print(" 失败，rc=");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}

/**
 * 初始化
 */
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 MQTT 继电器控制系统 ===");
  
  // 初始化引脚
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // 初始状态：继电器关闭
  digitalWrite(RELAY1_PIN, LOW);
  digitalWrite(RELAY2_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("🔌 继电器引脚已初始化");
  
  // 连接WiFi
  setup_wifi();
  
  // 配置MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mudge_callback);
  mqttClient.setBufferSize(512);
}

/**
 * 主循环
 */
void loop() {
  // 保持MQTT连接
  if (!mqttClient.connected()) {
    mqtt_reconnect();
  }
  mqttClient.loop();
  
  // 定时上报状态
  unsigned long now = millis();
  if (now - lastStatus > statusInterval) {
    lastStatus = now;
    publishStatus();
  }
}
```

### 项目6.4：MQTTX调试工具使用

**项目目标**：学习使用MQTTX图形化调试工具，与ESP32进行MQTT通信调试。

**工具介绍**：
MQTTX是一款开源的MQTT 5.0桌面客户端工具，支持Windows、macOS和Linux。它提供了友好的图形界面，方便进行MQTT消息的发布、订阅和调试。

**安装步骤**：

1. **下载MQTTX**：
   - 官网：https://mqttx.app/
   - GitHub：https://github.com/emqx/MQTTX

2. **安装过程**：
   - Windows：下载.exe安装包，双击安装
   - macOS：下载.dmg文件，拖入应用程序文件夹
   - Linux：下载.AppImage或使用包管理器安装

**使用教程**：

#### 步骤1：创建连接

1. 打开MQTTX，点击左上角"+"按钮创建新连接
2. 填写连接信息：
   ```
   名称：EMQX测试
   Client ID：mqttx-client-001（自动生成）
   服务器地址：broker.emqx.io
   端口：1883
   用户名：emqx
   密码：public
   ```
3. 点击"连接"按钮

#### 步骤2：订阅Topic

1. 连接成功后，在左侧"订阅"区域点击"新建订阅"
2. 输入要订阅的Topic，例如：`esp32/test/message`
3. QoS选择1
4. 点击"确认"

#### 步骤3：发布消息

1. 在消息输入框中输入Topic：`esp32/test/command`
2. 在消息内容中输入JSON格式的命令：
   ```json
   {
     "relay": 1,
     "state": true
   }
   ```
3. 点击发送按钮

#### 步骤4：与ESP32联合调试

**示例场景：测试项目6.3继电器控制**

1. **启动ESP32**：上传项目6.3代码，打开串口监视器
2. **MQTTX订阅状态Topic**：`home/relay/status`
3. **MQTTX发布控制命令**：
   - Topic：`home/relay/control`
   - 消息：`{"relay":1,"state":true}`（开启继电器1）
   - 消息：`{"relay":1,"state":false}`（关闭继电器1）
   - 消息：`{"all":true}`（开启所有继电器）
4. **观察结果**：
   - ESP32串口显示命令执行情况
   - MQTTX收到状态反馈消息
   - 继电器实际动作

#### 步骤5：使用MQTTX CLI（命令行工具）

```bash
# 安装MQTTX CLI
npm install -g mqttx

# 连接并订阅
mqttx sub -t "esp32/test/message" -h broker.emqx.io -p 1883

# 发布消息
mqttx pub -t "esp32/test/command" -h broker.emqx.io -p 1883 -m "LED_ON"

# 使用JSON格式发布
mqttx pub -t "home/relay/control" -h broker.emqx.io -p 1883 -m '{"relay":1,"state":true}'
```

## 7. 常见问题与解决方案

### 7.1 连接问题

**问题1：无法连接MQTT服务器**
```cpp
// 检查项：
// 1. WiFi是否连接成功
// 2. MQTT服务器地址和端口是否正确
// 3. 防火墙是否阻止了1883端口
// 4. MQTT服务器是否在线

// 调试代码：
Serial.print("MQTT状态: ");
Serial.println(mqttClient.state());
// 状态码说明：
// -4: 连接超时
// -3: 连接丢失
// -2: 连接失败
// -1: 断开连接
// 0: 已断开
// 1: 已连接
// 2: 连接中
// 3: 正在断开
```

**问题2：连接频繁断开**
```cpp
// 解决方案：
// 1. 增加Keep Alive时间
mqttClient.setKeepAlive(60);  // 默认15秒，改为60秒

// 2. 确保在loop()中调用client.loop()
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();  // 必须调用，处理消息和维持连接
}

// 3. 检查网络稳定性
if (WiFi.status() != WL_CONNECTED) {
  WiFi.reconnect();
}
```

### 7.2 消息问题

**问题3：收不到消息**
```cpp
// 检查项：
// 1. 是否调用了subscribe()
// 2. 是否在loop()中调用了client.loop()
// 3. Topic是否正确（区分大小写）
// 4. 回调函数是否正确设置

// 调试：在回调函数中添加打印
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("=== 进入回调函数 ===");
  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("长度: ");
  Serial.println(length);
}
```

**问题4：消息发送失败**
```cpp
// 检查返回值
if (mqttClient.publish(topic, message)) {
  Serial.println("发送成功");
} else {
  Serial.println("发送失败");
}

// 可能原因：
// 1. 未连接到服务器
// 2. 消息长度超过缓冲区大小
// 3. Topic格式不正确

// 增大缓冲区
mqttClient.setBufferSize(1024);  // 默认256字节
```

### 7.3 性能优化

**问题5：内存不足**
```cpp
// 1. 使用StaticJsonDocument替代DynamicJsonDocument
StaticJsonDocument<200> doc;  // 栈上分配，更快

// 2. 及时释放内存
// 3. 减少全局变量使用
// 4. 使用PROGMEM存储常量字符串
const char mqtt_server[] PROGMEM = "broker.emqx.io";
```

## 8. 进阶技巧

### 8.1 遗嘱消息（Last Will）

```cpp
// 设置遗嘱消息，设备异常断开时自动发布
bool willRetain = true;  // 保留消息
int willQos = 1;         // QoS级别
const char* willTopic = "device/status";
const char* willMessage = "设备离线";

mqttClient.connect(clientId, user, pass, willTopic, willQos, willRetain, willMessage);
```

### 8.2 保留消息（Retained Message）

```cpp
// 发布保留消息，新订阅者立即获取最新状态
bool retain = true;
mqttClient.publish(topic, message, retain);
```

### 8.3 遗嘱消息+保留消息组合

```cpp
// 设备上线时发布在线状态（保留）
mqttClient.publish("device/status", "在线", true);

// 设置遗嘱消息（保留）
// 这样新订阅者可以立即知道设备当前状态
```

## 9. 本章总结

本章详细介绍了MQTT协议在物联网中的应用：

1. **协议基础**：发布/订阅模式、QoS、Topic设计
2. **库使用**：PubSubClient库的安装和API使用
3. **服务器**：公共MQTT Broker（EMQX）的使用
4. **数据格式**：JSON消息的设计和处理
5. **安全通信**：TLS/SSL加密配置
6. **实战项目**：四个完整的实战项目

**学习建议**：
1. 先完成基础项目6.1，理解MQTT基本工作流程
2. 项目6.2学习传感器数据采集和JSON处理
3. 项目6.3掌握远程控制实现方法
4. 项目6.4学会使用调试工具提高开发效率

**下一步学习**：
- 第7章将介绍如何将MQTT与Home Assistant集成
- 学习更多传感器的使用方法
- 探索MQTT在工业物联网中的应用

## 附录：代码库依赖

在Arduino IDE中需要安装以下库：

1. **PubSubClient** - MQTT客户端
   - 作者：Nick O'Leary
   - 安装：库管理器搜索"PubSubClient"

2. **DHT sensor library** - DHT传感器库
   - 作者：Adafruit
   - 安装：库管理器搜索"DHT sensor library"

3. **ArduinoJson** - JSON处理库
   - 作者：Benoit Blanchon
   - 安装：库管理器搜索"ArduinoJson"

4. **Adafruit Unified Sensor** - 传感器统一接口
   - 作者：Adafruit
   - 安装：库管理器搜索"Adafruit Unified Sensor"

---

**版权声明**：本教程为AIoT学习系列教程的一部分，仅供学习交流使用。