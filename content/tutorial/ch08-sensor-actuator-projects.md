# 第8章：传感器与执行器综合实战

## 学习目标

学完本章，你将能够：
- 了解常用传感器的分类、选型和使用方法
- 掌握传感器数据滤波技术（移动平均、中值滤波）
- 安全使用继电器控制强电设备
- 控制舵机和步进电机
- 完成多个传感器+执行器的综合项目

---

## 8.1 常用传感器分类

### 按输出类型分类

| 类型 | 特点 | 常见例子 |
|------|------|---------|
| 模拟传感器 | 输出连续电压值 | 光敏电阻、MQ-2气体传感器 |
| 数字传感器 | 输出高低电平 | HC-SR501人体红外、门磁开关 |
| 数字通信传感器 | 通过协议传输数据 | DHT22（单总线）、BMP280（I2C） |

### 本教程用到的传感器

| 传感器 | 功能 | 接口 | 价格 |
|--------|------|------|------|
| DHT22 | 温湿度 | 单总线 | ¥8 |
| HC-SR501 | 人体红外感应 | 数字输出 | ¥5 |
| 光敏电阻模块 | 光照强度 | 模拟/数字 | ¥3 |
| HC-SR04 | 超声波测距 | 数字触发/回响 | ¥5 |
| MQ-2 | 烟雾/可燃气体 | 模拟/数字 | ¥6 |

---

## 8.2 传感器数据滤波

传感器数据往往有噪声，需要滤波处理。

### 移动平均滤波

```cpp
#define FILTER_SIZE 10
float readings[FILTER_SIZE];
int readIndex = 0;
float total = 0;

float movingAverage(float newValue) {
    total = total - readings[readIndex];  // 减去最旧的值
    readings[readIndex] = newValue;       // 存入新值
    total = total + newValue;             // 加上新值
    readIndex = (readIndex + 1) % FILTER_SIZE;
    return total / FILTER_SIZE;           // 返回平均值
}
```

### 中值滤波

```cpp
#define MEDIAN_SIZE 5

float medianFilter(float newValue) {
    static float buffer[MEDIAN_SIZE];
    static int index = 0;
    
    buffer[index] = newValue;
    index = (index + 1) % MEDIAN_SIZE;
    
    // 复制并排序
    float sorted[MEDIAN_SIZE];
    memcpy(sorted, buffer, sizeof(buffer));
    
    // 简单冒泡排序
    for (int i = 0; i < MEDIAN_SIZE - 1; i++) {
        for (int j = 0; j < MEDIAN_SIZE - 1 - i; j++) {
            if (sorted[j] > sorted[j + 1]) {
                float temp = sorted[j];
                sorted[j] = sorted[j + 1];
                sorted[j + 1] = temp;
            }
        }
    }
    
    return sorted[MEDIAN_SIZE / 2];  // 返回中值
}
```

---

## 8.3 继电器安全使用

### 继电器原理

继电器是用小电流控制大电流的开关。ESP32的GPIO输出3.3V/20mA，无法直接驱动220V设备，继电器做中间人。

### 安全注意事项

⚠️ **强电危险！** 操作220V电路必须：
1. 先断电再接线
2. 使用继电器模块（已隔离），不要裸焊
3. 确认继电器额定电流大于负载电流
4. 接地线不经过继电器，直接连接

### 接线

```
ESP32          继电器模块           负载（灯/风扇）
─────          ──────────           ──────────────
GPIO26 ─────── IN
3.3V  ─────── VCC
GND   ─────── GND
                    COM ──────────── 火线入
                    NO  ──────────── 灯的一端
                                    灯的另一端 ── 零线
```

---

## 8.4 舵机控制

SG90舵机通过PWM信号控制角度：
- 50Hz（周期20ms）
- 脉宽0.5ms = 0°
- 脉宽1.5ms = 90°
- 脉宽2.5ms = 180°

```cpp
#include <ESP32Servo.h>

Servo myServo;

void setup() {
    myServo.attach(13);  // GPIO13接舵机信号线
}

void loop() {
    for (int angle = 0; angle <= 180; angle++) {
        myServo.write(angle);
        delay(15);
    }
    for (int angle = 180; angle >= 0; angle--) {
        myServo.write(angle);
        delay(15);
    }
}
```

---

## 8.5 步进电机控制（28BYJ-48 + ULN2003）

```cpp
// ULN2003驱动板引脚
#define IN1 19
#define IN2 18
#define IN3 5
#define IN4 17

// 步进序列（半步驱动，8拍）
const int stepSequence[8][4] = {
    {1, 0, 0, 0},
    {1, 1, 0, 0},
    {0, 1, 0, 0},
    {0, 1, 1, 0},
    {0, 0, 1, 0},
    {0, 0, 1, 1},
    {0, 0, 0, 1},
    {1, 0, 0, 1}
};

int stepIndex = 0;

void stepMotor(int steps, bool direction) {
    for (int i = 0; i < steps; i++) {
        if (direction) {
            stepIndex = (stepIndex + 1) % 8;
        } else {
            stepIndex = (stepIndex - 1 + 8) % 8;
        }
        
        digitalWrite(IN1, stepSequence[stepIndex][0]);
        digitalWrite(IN2, stepSequence[stepIndex][1]);
        digitalWrite(IN3, stepSequence[stepIndex][2]);
        digitalWrite(IN4, stepSequence[stepIndex][3]);
        delay(2);  // 调整速度
    }
}

void setup() {
    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    pinMode(IN3, OUTPUT);
    pinMode(IN4, OUTPUT);
}

void loop() {
    stepMotor(2048, true);   // 正转一圈（2048步=360°）
    delay(1000);
    stepMotor(2048, false);  // 反转一圈
    delay(1000);
}
```

---

## 项目8.1：智能环境监测站

### 目标
ESP32采集温湿度、光照、人体感应数据，通过MQTT发送到Home Assistant。

### BOM表

| 物品 | 数量 | 价格 |
|------|------|------|
| ESP32-DevKitC | 1 | ¥25 |
| DHT22 | 1 | ¥8 |
| 光敏电阻模块 | 1 | ¥3 |
| HC-SR501 PIR | 1 | ¥5 |
| 面包板+杜邦线 | 1套 | ¥10 |
| **合计** | | **~¥51** |

### 接线
```
ESP32          传感器
─────          ───────
GPIO4  ──────── DHT22 DATA
GPIO34 ──────── 光敏电阻 AO（模拟输出）
GPIO27 ──────── HC-SR501 OUT
3.3V   ──────── 各传感器 VCC
GND    ──────── 各传感器 GND
```

### 代码

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// WiFi配置
const char* ssid = "你的WiFi名";
const char* password = "你的WiFi密码";

// MQTT配置
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "home/env_station/data";

// 引脚定义
#define DHT_PIN 4
#define LIGHT_PIN 34
#define PIR_PIN 27

#define DHT_TYPE DHT22

// 全局对象
WiFiClient espClient;
PubSubClient mqtt(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

// 上次发送时间
unsigned long lastSend = 0;
const long sendInterval = 5000;  // 5秒发送一次

void setup_wifi() {
    Serial.print("连接WiFi: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi已连接");
    Serial.print("IP地址: ");
    Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
    while (!mqtt.connected()) {
        Serial.print("连接MQTT...");
        String clientId = "ESP32-EnvStation-" + String(random(0xffff), HEX);
        if (mqtt.connect(clientId.c_str())) {
            Serial.println("已连接");
        } else {
            Serial.print("失败，rc=");
            Serial.print(mqtt.state());
            Serial.println(" 5秒后重试");
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    dht.begin();
    pinMode(PIR_PIN, INPUT);
    
    setup_wifi();
    mqtt.setServer(mqtt_server, mqtt_port);
}

void loop() {
    if (!mqtt.connected()) {
        reconnect_mqtt();
    }
    mqtt.loop();
    
    unsigned long now = millis();
    if (now - lastSend >= sendInterval) {
        lastSend = now;
        
        // 读取传感器
        float temperature = dht.readTemperature();
        float humidity = dht.readHumidity();
        int lightValue = analogRead(LIGHT_PIN);
        int pirValue = digitalRead(PIR_PIN);
        
        // 检查DHT读取是否成功
        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("DHT读取失败");
            return;
        }
        
        // 构建JSON
        String payload = "{";
        payload += "\"temperature\":" + String(temperature, 1) + ",";
        payload += "\"humidity\":" + String(humidity, 1) + ",";
        payload += "\"light\":" + String(lightValue) + ",";
        payload += "\"motion\":" + String(pirValue);
        payload += "}";
        
        // 发布到MQTT
        mqtt.publish(mqtt_topic, payload.c_str());
        
        // 串口输出
        Serial.println("====== 环境数据 ======");
        Serial.print("温度: "); Serial.print(temperature); Serial.println(" °C");
        Serial.print("湿度: "); Serial.print(humidity); Serial.println(" %");
        Serial.print("光照: "); Serial.println(lightValue);
        Serial.print("人体: "); Serial.println(pirValue ? "有人" : "无人");
        Serial.println("已发送到MQTT");
    }
}
```

---

## 项目8.2：自动窗帘系统

### 目标
光照过强自动关窗帘，光照不足自动开窗帘。

### BOM表

| 物品 | 数量 | 价格 |
|------|------|------|
| ESP32-DevKitC | 1 | ¥25 |
| 光敏电阻模块 | 1 | ¥3 |
| 28BYJ-48步进电机 | 1 | ¥8 |
| ULN2003驱动板 | 1 | ¥3 |
| 面包板+杜邦线 | 1套 | ¥10 |
| **合计** | | **~¥49** |

### 接线
```
ESP32          模块
─────          ────
GPIO34 ──────── 光敏电阻 AO
GPIO19 ──────── ULN2003 IN1
GPIO18 ──────── ULN2003 IN2
GPIO5  ──────── ULN2003 IN3
GPIO17 ──────── ULN2003 IN4
5V     ──────── ULN2003 VCC（注意：步进电机用5V供电）
```

### 代码

```cpp
#define LIGHT_PIN 34
#define IN1 19
#define IN2 18
#define IN3 5
#define IN4 17

#define LIGHT_THRESHOLD_HIGH 3000  // 光照过强阈值（关窗帘）
#define LIGHT_THRESHOLD_LOW 1000   // 光照不足阈值（开窗帘）

bool curtainOpen = true;  // 窗帘状态

// 步进序列
const int stepSequence[8][4] = {
    {1, 0, 0, 0}, {1, 1, 0, 0}, {0, 1, 0, 0}, {0, 1, 1, 0},
    {0, 0, 1, 0}, {0, 0, 1, 1}, {0, 0, 0, 1}, {1, 0, 0, 1}
};
int stepIndex = 0;

void stepMotor(int steps, bool direction) {
    for (int i = 0; i < steps; i++) {
        stepIndex = direction ? (stepIndex + 1) % 8 : (stepIndex - 1 + 8) % 8;
        digitalWrite(IN1, stepSequence[stepIndex][0]);
        digitalWrite(IN2, stepSequence[stepIndex][1]);
        digitalWrite(IN3, stepSequence[stepIndex][2]);
        digitalWrite(IN4, stepSequence[stepIndex][3]);
        delay(2);
    }
    // 关闭电机（省电）
    digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

void setup() {
    Serial.begin(115200);
    pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
    pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
}

void loop() {
    int lightValue = analogRead(LIGHT_PIN);
    Serial.print("光照值: "); Serial.println(lightValue);
    
    if (lightValue > LIGHT_THRESHOLD_HIGH && curtainOpen) {
        // 光照过强，关窗帘
        Serial.println("光照过强，关闭窗帘...");
        stepMotor(4096, true);  // 转两圈模拟关窗帘
        curtainOpen = false;
    } else if (lightValue < LIGHT_THRESHOLD_LOW && !curtainOpen) {
        // 光照不足，开窗帘
        Serial.println("光照不足，打开窗帘...");
        stepMotor(4096, false);  // 反转两圈模拟开窗帘
        curtainOpen = true;
    }
    
    delay(2000);  // 2秒检测一次
}
```

---

## 项目8.3：智能安防系统

### 目标
人体感应触发报警（蜂鸣器+灯闪烁），并发送MQTT通知。

### BOM表

| 物品 | 数量 | 价格 |
|------|------|------|
| ESP32-DevKitC | 1 | ¥25 |
| HC-SR501 PIR | 1 | ¥5 |
| 有源蜂鸣器 | 1 | ¥2 |
| 继电器模块 | 1 | ¥5 |
| 面包板+杜邦线 | 1套 | ¥10 |
| **合计** | | **~¥47** |

### 接线
```
ESP32          模块
─────          ────
GPIO27 ──────── HC-SR501 OUT
GPIO25 ──────── 蜂鸣器+
GPIO26 ──────── 继电器IN
3.3V   ──────── 各模块VCC
GND    ──────── 各模块GND
```

### 代码

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi/MQTT配置
const char* ssid = "你的WiFi名";
const char* password = "你的WiFi密码";
const char* mqtt_server = "broker.emqx.io";
const char* mqtt_topic = "home/alarm/alert";

#define PIR_PIN 27
#define BUZZER_PIN 25
#define RELAY_PIN 26

WiFiClient espClient;
PubSubClient mqtt(espClient);
bool alarmActive = false;
unsigned long alarmStartTime = 0;
const long alarmDuration = 10000;  // 报警持续10秒

void setup_wifi() {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) delay(500);
    Serial.println("WiFi已连接");
}

void setup() {
    Serial.begin(115200);
    pinMode(PIR_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(RELAY_PIN, LOW);
    
    setup_wifi();
    mqtt.setServer(mqtt_server, 1883);
}

void triggerAlarm() {
    alarmActive = true;
    alarmStartTime = millis();
    
    // 发送MQTT报警
    mqtt.publish(mqtt_topic, "{\"alert\":\"motion_detected\",\"time\":\"now\"}");
    Serial.println("⚠️ 检测到人体！报警已触发");
}

void loop() {
    if (!mqtt.connected()) {
        String clientId = "ESP32-Alarm-" + String(random(0xffff), HEX);
        mqtt.connect(clientId.c_str());
    }
    mqtt.loop();
    
    // 检测人体
    if (digitalRead(PIR_PIN) == HIGH && !alarmActive) {
        triggerAlarm();
    }
    
    // 报警处理
    if (alarmActive) {
        unsigned long elapsed = millis() - alarmStartTime;
        
        if (elapsed < alarmDuration) {
            // 闪烁+蜂鸣
            bool onOff = (elapsed / 200) % 2;  // 200ms间隔闪烁
            digitalWrite(BUZZER_PIN, onOff);
            digitalWrite(RELAY_PIN, onOff);
        } else {
            // 报警结束
            alarmActive = false;
            digitalWrite(BUZZER_PIN, LOW);
            digitalWrite(RELAY_PIN, LOW);
            Serial.println("报警结束");
        }
    }
    
    delay(50);
}
```

---

## 扩展思考

1. **多传感器数据融合**：结合温度、湿度、光照数据，使用简单规则（如加权平均）判断环境舒适度。

2. **项目集成思路**：将8.1+8.2+8.3组合成一个完整的智能家居系统，通过Home Assistant统一管理。

3. **低功耗优化**：使用ESP32深度睡眠，在PIR触发时唤醒，电池供电可用数月。
