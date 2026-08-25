# 第4章：串口通信（UART）

## 学习目标
完成本章学习后，你将能够：
- 理解串口通信的基本原理和UART协议
- 掌握ESP32的三个硬件UART配置和使用方法
- 实现Arduino/ESP32与计算机的串口通信
- 使用GPS模块（NEO-6M）读取和处理NMEA数据
- 实现两块ESP32开发板之间的UART通信
- 掌握串口调试技巧和常见问题排查方法

## 1. 串口通信基础

### 1.1 什么是串口通信？
串口通信（Serial Communication）是一种按位（bit）传输数据的通信方式，与并行通信相对应。UART（Universal Asynchronous Receiver/Transmitter，通用异步收发传输器）是最常见的串口通信协议之一。

### 1.2 UART通信特点
- **异步通信**：没有时钟信号同步，依靠预定义的波特率
- **全双工**：可以同时发送和接收数据
- **点对点**：通常用于两个设备之间的通信
- **简单**：只需要两根信号线（TX和RX）

### 1.3 UART帧格式详解
标准UART帧格式（8N1）如下：
```
空闲位 | 起始位 | 数据位(8位) | 校验位(可选) | 停止位(1/1.5/2位)
```

- **起始位**：1位，逻辑0（低电平）
- **数据位**：5-9位，通常为8位
- **校验位**：可选，用于错误检测
  - 无校验（None）
  - 奇校验（Odd）
  - 偶校验（Even）
- **停止位**：1、1.5或2位，逻辑1（高电平）

### 1.4 波特率（Baud Rate）
波特率表示每秒传输的符号数，常见值：
- 9600 bps（传统设备）
- 19200 bps
- 38400 bps
- 57600 bps
- 115200 bps（ESP32常用）
- 921600 bps（高速传输）

## 2. ESP32的UART硬件

### 2.1 ESP32的三个硬件UART
ESP32提供三个独立的硬件UART：
- **UART0**：通常用于编程和调试（Serial）
- **UART1**：默认用于Flash通信，可重新映射
- **UART2**：可用作额外串口（Serial2）

### 2.2 ESP32 UART引脚映射
默认引脚分配：
| UART | TX引脚 | RX引脚 | 说明 |
|------|--------|--------|------|
| UART0 | GPIO1 | GPIO3 | 编程/调试串口 |
| UART1 | GPIO10 | GPIO9 | 默认连接Flash，需重新映射 |
| UART2 | GPIO17 | GPIO16 | 可直接使用 |

> **重要提示**：ESP32的UART引脚可以重新映射到任意GPIO，这是其重要优势之一。

### 2.3 电平标准
ESP32的UART工作在3.3V TTL电平：
- 逻辑0：0V-0.8V
- 逻辑1：2V-3.3V
- 输入容忍：所有引脚都可容忍3.3V输入

## 3. Arduino Serial库详解

### 3.1 Serial对象
Arduino框架提供了三个Serial对象：
- `Serial`：对应UART0（默认串口）
- `Serial1`：对应UART1
- `Serial2`：对应UART2

### 3.2 常用Serial函数
```cpp
Serial.begin(baudRate);                    // 初始化串口
Serial.begin(baudRate, config);            // 带配置初始化
Serial.begin(baudRate, config, rxPin, txPin); // 带引脚映射初始化

Serial.available();                        // 检查可读字节数
Serial.read();                             // 读取一个字节
Serial.readString();                       // 读取字符串
Serial.readStringUntil('\n');              // 读取到换行符

Serial.write(data);                        // 写入原始数据
Serial.print(data);                        // 打印数据
Serial.println(data);                      // 打印数据并换行

Serial.flush();                            // 等待发送完成
Serial.end();                              // 关闭串口
```

### 3.3 HardwareSerial类
ESP32的HardwareSerial类支持更灵活的配置：
```cpp
#include <HardwareSerial.h>

HardwareSerial mySerial(1);  // 使用UART1

void setup() {
  // 初始化UART1，波特率9600，配置8N1，指定RX=4，TX=2
  mySerial.begin(9600, SERIAL_8N1, 4, 2);
}
```

## 4. USB-TTL模块使用

### 4.1 常见USB-TTL芯片
- **CH340/CH341**：价格低廉，广泛使用
- **CP2102**：Silicon Labs出品，稳定性好
- **FT232**：性能优秀，价格较高

### 4.2 连接注意事项
1. **电平匹配**：确保模块输出电平与ESP32兼容（3.3V）
2. **交叉连接**：TX连接到RX，RX连接到TX
3. **共地连接**：确保两个设备有共同的地线
4. **供电能力**：某些模块可提供3.3V/5V电源输出

### 4.3 驱动安装
- **Windows**：通常需要安装CH340/CP2102驱动
- **Linux**：一般已内置支持
- **macOS**：需要安装对应驱动

## 5. 实操项目

### 项目4.1：Arduino与电脑串口双向通信

**目标**：实现ESP32与计算机的双向串口通信，通过串口监视器控制LED并显示消息。

**硬件连接**：
- ESP32开发板通过USB连接电脑
- LED连接到GPIO2（内置LED）

**代码**：
```cpp
/*
 * 项目4.1：Arduino与电脑串口双向通信
 * 功能：通过串口监视器控制LED，ESP32回复确认消息
 */

// 定义LED引脚（ESP32内置LED通常在GPIO2）
const int LED_PIN = 2;

// 用于存储接收到的数据
String inputString = "";
bool stringComplete = false;

void setup() {
  // 初始化串口，波特率115200
  Serial.begin(115200);
  
  // 设置LED引脚为输出模式
  pinMode(LED_PIN, OUTPUT);
  
  // 等待串口连接（仅用于原生USB板）
  while (!Serial) {
    ; // 等待串口连接
  }
  
  // 发送欢迎消息
  Serial.println("=== ESP32串口通信示例 ===");
  Serial.println("发送命令控制LED：");
  Serial.println("  'on'  - 打开LED");
  Serial.println("  'off' - 关闭LED");
  Serial.println("  'blink' - 闪烁LED");
  Serial.println("  'status' - 查询LED状态");
  Serial.println("=========================");
}

void loop() {
  // 检查是否有数据可读
  while (Serial.available()) {
    // 读取一个字节
    char inChar = (char)Serial.read();
    
    // 将字节添加到输入字符串
    inputString += inChar;
    
    // 如果收到换行符，标记字符串完成
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
  
  // 如果字符串完成，处理命令
  if (stringComplete) {
    // 去除字符串两端的空白字符
    inputString.trim();
    
    // 转换为小写以便比较
    String command = inputString;
    command.toLowerCase();
    
    // 处理命令
    if (command == "on") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED已打开");
    }
    else if (command == "off") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED已关闭");
    }
    else if (command == "blink") {
      Serial.println("LED闪烁3次...");
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
        delay(200);
      }
      Serial.println("闪烁完成");
    }
    else if (command == "status") {
      int ledState = digitalRead(LED_PIN);
      Serial.print("LED当前状态: ");
      Serial.println(ledState ? "ON" : "OFF");
    }
    else if (command == "help") {
      Serial.println("可用命令：on, off, blink, status, help");
    }
    else {
      Serial.print("未知命令: ");
      Serial.println(inputString);
      Serial.println("输入 'help' 查看可用命令");
    }
    
    // 清空输入字符串，准备下一次接收
    inputString = "";
    stringComplete = false;
  }
  
  // 可以添加其他非阻塞任务
  delay(10);
}
```

**操作步骤**：
1. 将代码上传到ESP32
2. 打开串口监视器（波特率设置为115200）
3. 在发送框输入命令并点击发送
4. 观察LED变化和串口反馈

### 项目4.2：ESP32读取GPS模块（NEO-6M）NMEA数据

**目标**：使用ESP32读取NEO-6M GPS模块的NMEA数据，解析出位置、时间等信息。

**硬件连接**：
```
NEO-6M GPS模块  →  ESP32
VCC             →  3.3V
GND             →  GND
TX              →  GPIO16 (UART2 RX)
RX              →  GPIO17 (UART2 TX)
```

**代码（原始NMEA数据读取）**：
```cpp
/*
 * 项目4.2：ESP32读取GPS模块原始NMEA数据
 * 功能：从NEO-6M GPS模块读取并显示原始NMEA语句
 */

#include <HardwareSerial.h>

// 创建HardwareSerial对象，使用UART2
HardwareSerial gpsSerial(2);

// GPS模块连接引脚
const int GPS_RX_PIN = 16;  // ESP32 RX ← GPS TX
const int GPS_TX_PIN = 17;  // ESP32 TX → GPS RX

// 统计变量
unsigned long lastUpdate = 0;
int sentenceCount = 0;

void setup() {
  // 初始化调试串口（UART0）
  Serial.begin(115200);
  
  // 初始化GPS串口（UART2）
  // NEO-6M默认波特率为9600
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  // 等待串口初始化
  delay(1000);
  
  Serial.println("=== ESP32 GPS NMEA数据读取 ===");
  Serial.println("正在等待GPS信号...");
  Serial.println("请确保GPS模块已连接并处于开阔区域");
  Serial.println("==============================");
}

void loop() {
  // 检查GPS串口是否有数据
  while (gpsSerial.available()) {
    // 读取并输出GPS数据
    char c = gpsSerial.read();
    Serial.write(c);
    
    // 统计NMEA语句数量（以换行符结尾）
    if (c == '\n') {
      sentenceCount++;
    }
  }
  
  // 每5秒显示一次统计信息
  if (millis() - lastUpdate > 5000) {
    lastUpdate = millis();
    Serial.print("\n[统计] 已接收 ");
    Serial.print(sentenceCount);
    Serial.println(" 条NMEA语句");
    
    if (sentenceCount == 0) {
      Serial.println("提示：未收到GPS数据，请检查：");
      Serial.println("1. 接线是否正确（TX→RX，RX→TX）");
      Serial.println("2. GPS模块是否已通电");
      Serial.println("3. GPS天线是否已连接");
      Serial.println("4. 是否处于开阔区域（无遮挡）");
    }
  }
}
```

**代码（使用TinyGPS++库解析）**：
```cpp
/*
 * 项目4.2：使用TinyGPS++库解析GPS数据
 * 功能：解析NMEA数据，显示经纬度、海拔、速度、时间等信息
 */

#include <HardwareSerial.h>
#include <TinyGPS++.h>

// 创建HardwareSerial对象，使用UART2
HardwareSerial gpsSerial(2);

// 创建TinyGPS++对象
TinyGPSPlus gps;

// GPS模块连接引脚
const int GPS_RX_PIN = 16;  // ESP32 RX ← GPS TX
const int GPS_TX_PIN = 17;  // ESP32 TX → GPS RX

// 显示更新计时器
unsigned long lastDisplay = 0;
const unsigned long DISPLAY_INTERVAL = 1000;  // 1秒更新一次

void setup() {
  // 初始化调试串口
  Serial.begin(115200);
  
  // 初始化GPS串口
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  delay(1000);
  
  Serial.println("=== ESP32 GPS解析器 (TinyGPS++) ===");
  Serial.println("正在搜索GPS信号...");
  Serial.println("===================================");
}

void loop() {
  // 持续从GPS串口读取数据并喂给TinyGPS++解析
  while (gpsSerial.available()) {
    char c = gpsSerial.read();
    // 将数据喂给GPS解析器
    gps.encode(c);
  }
  
  // 定时显示解析结果
  if (millis() - lastDisplay > DISPLAY_INTERVAL) {
    lastDisplay = millis();
    displayGPSInfo();
  }
}

void displayGPSInfo() {
  Serial.println("--- GPS信息 ---");
  
  // 检查是否收到有效的GPS数据
  if (gps.charsProcessed() < 10) {
    Serial.println("警告：未收到GPS数据，请检查连接");
    return;
  }
  
  // 显示位置信息
  Serial.print("位置: ");
  if (gps.location.isValid()) {
    Serial.print(gps.location.lat(), 6);  // 纬度
    Serial.print(", ");
    Serial.print(gps.location.lng(), 6);  // 经度
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  // 显示日期和时间
  Serial.print("日期/时间: ");
  if (gps.date.isValid() && gps.time.isValid()) {
    char sz[32];
    sprintf(sz, "%02d/%02d/%02d %02d:%02d:%02d",
            gps.date.year(),
            gps.date.month(),
            gps.date.day(),
            gps.time.hour(),
            gps.time.minute(),
            gps.time.second());
    Serial.print(sz);
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  // 显示海拔
  Serial.print("海拔: ");
  if (gps.altitude.isValid()) {
    Serial.print(gps.altitude.meters());
    Serial.print(" 米");
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  // 显示速度
  Serial.print("速度: ");
  if (gps.speed.isValid()) {
    Serial.print(gps.speed.kmph());
    Serial.print(" 公里/小时");
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  // 显示卫星数量
  Serial.print("卫星数量: ");
  if (gps.satellites.isValid()) {
    Serial.print(gps.satellites.value());
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  // 显示精度
  Serial.print("水平精度: ");
  if (gps.hdop.isValid()) {
    Serial.print(gps.hdop.hdop());
  } else {
    Serial.print("无效");
  }
  Serial.println();
  
  Serial.println("--- 结束 ---\n");
}
```

**NMEA语句示例**：
```
$GPGGA,123519.00,4807.038,N,01131.000,E,1,08,0.9,545.4,M,47.0,M,,*47
$GPRMC,123519.00,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A
```

**常见NMEA语句类型**：
- **GPGGA**：GPS定位数据（时间、位置、卫星数等）
- **GPRMC**：推荐最小定位信息（时间、日期、位置、速度）
- **GPGSV**：可见卫星信息
- **GPGSA**：当前卫星参与定位信息

### 项目4.3：两块ESP32通过UART互传温湿度数据

**目标**：实现两块ESP32开发板之间的UART通信，一块读取温湿度数据并发送，另一块接收并显示。

**硬件连接**：
```
ESP32-A (发送端)        ESP32-B (接收端)
GPIO17 (TX2)  ────────→ GPIO16 (RX2)
GPIO16 (RX2)  ←───────── GPIO17 (TX2)
GND           ────────── GND
```

**发送端代码（ESP32-A）**：
```cpp
/*
 * 项目4.3-A：ESP32 UART数据发送端
 * 功能：读取DHT11温湿度数据，通过UART2发送到另一块ESP32
 */

#include <HardwareSerial.h>
#include <DHT.h>

// UART配置
HardwareSerial uartToReceiver(2);  // 使用UART2
const int TX_PIN = 17;             // 发送引脚
const int RX_PIN = 16;             // 接收引脚

// DHT传感器配置
#define DHTPIN 4                   // DHT数据引脚
#define DHTTYPE DHT11              // DHT11或DHT22
DHT dht(DHTPIN, DHTTYPE);

// 数据发送间隔（毫秒）
const unsigned long SEND_INTERVAL = 2000;
unsigned long lastSend = 0;

// 数据包序号
uint32_t packetNumber = 0;

void setup() {
  // 初始化调试串口
  Serial.begin(115200);
  
  // 初始化UART2用于发送数据
  uartToReceiver.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  
  // 初始化DHT传感器
  dht.begin();
  
  delay(1000);
  
  Serial.println("=== ESP32 UART数据发送端 ===");
  Serial.println("开始读取温湿度数据并发送...");
  Serial.println("===========================");
}

void loop() {
  // 定时发送数据
  if (millis() - lastSend > SEND_INTERVAL) {
    lastSend = millis();
    
    // 读取温湿度数据
    float temperature = dht.readTemperature();    // 摄氏度
    float humidity = dht.readHumidity();          // 相对湿度%
    
    // 检查读取是否成功
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("DHT传感器读取失败！");
      return;
    }
  
    // 增加数据包序号
    packetNumber++;
    
    // 构建数据包（JSON格式）
    String dataPacket = "{";
    dataPacket += "\"id\":" + String(packetNumber) + ",";
    dataPacket += "\"temp\":" + String(temperature, 1) + ",";
    dataPacket += "\"humi\":" + String(humidity, 1) + ",";
    dataPacket += "\"millis\":" + String(millis());
    dataPacket += "}\n";  // 以换行符作为数据包结束标记
    
    // 通过UART2发送数据
    uartToReceiver.print(dataPacket);
    
    // 在本地串口显示发送的数据
    Serial.print("发送数据包 #");
    Serial.print(packetNumber);
    Serial.print(": ");
    Serial.print(temperature, 1);
    Serial.print("°C, ");
    Serial.print(humidity, 1);
    Serial.println("%");
  }
  
  // 检查是否有来自接收端的响应
  if (uartToReceiver.available()) {
    String response = uartToReceiver.readStringUntil('\n');
    Serial.print("收到响应: ");
    Serial.println(response);
  }
  
  delay(10);
}
```

**接收端代码（ESP32-B）**：
```cpp
/*
 * 项目4.3-B：ESP32 UART数据接收端
 * 功能：通过UART2接收温湿度数据，在串口显示并控制LED指示
 */

#include <HardwareSerial.h>

// UART配置
HardwareSerial uartFromSender(2);  // 使用UART2
const int TX_PIN = 17;             // 发送引脚（用于响应）
const int RX_PIN = 16;             // 接收引脚

// LED指示灯
const int LED_TEMP = 2;            // 温度指示LED
const int LED_HUMI = 15;           // 湿度指示LED

// 数据接收缓冲区
String inputBuffer = "";
bool dataReady = false;

// 统计信息
uint32_t receivedPackets = 0;
uint32_t errorPackets = 0;

// 温度/湿度阈值
const float TEMP_THRESHOLD = 30.0;  // 温度阈值（°C）
const float HUMI_THRESHOLD = 70.0;  // 湿度阈值（%）

void setup() {
  // 初始化调试串口
  Serial.begin(115200);
  
  // 初始化UART2用于接收数据
  uartFromSender.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  
  // 初始化LED引脚
  pinMode(LED_TEMP, OUTPUT);
  pinMode(LED_HUMI, OUTPUT);
  
  // 初始LED状态
  digitalWrite(LED_TEMP, LOW);
  digitalWrite(LED_HUMI, LOW);
  
  delay(1000);
  
  Serial.println("=== ESP32 UART数据接收端 ===");
  Serial.println("等待接收数据...");
  Serial.println("温度阈值: " + String(TEMP_THRESHOLD) + "°C");
  Serial.println("湿度阈值: " + String(HUMI_THRESHOLD) + "%");
  Serial.println("===========================");
}

void loop() {
  // 读取UART数据
  while (uartFromSender.available()) {
    char c = uartFromSender.read();
    
    // 将字符添加到缓冲区
    inputBuffer += c;
    
    // 检查是否收到完整数据包（以换行符结尾）
    if (c == '\n') {
      dataReady = true;
    }
  }
  
  // 处理完整数据包
  if (dataReady) {
    processDataPacket(inputBuffer);
    inputBuffer = "";
    dataReady = false;
  }
  
  // 发送心跳响应（每5秒）
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 5000) {
    lastHeartbeat = millis();
    uartFromSender.println("{\"status\":\"alive\"}");
  }
  
  delay(10);
}

void processDataPacket(String packet) {
  // 去除空白字符
  packet.trim();
  
  // 简单的JSON解析
  // 格式: {"id":123,"temp":25.5,"humi":60.2,"millis":12345}
  
  // 检查数据包完整性
  if (!packet.startsWith("{") || !packet.endsWith("}")) {
    errorPackets++;
    Serial.print("错误数据包 #");
    Serial.print(errorPackets);
    Serial.print(": ");
    Serial.println(packet);
    return;
  }
  
  // 提取数据（简化版解析）
  int idIndex = packet.indexOf("\"id\":");
  int tempIndex = packet.indexOf("\"temp\":");
  int humiIndex = packet.indexOf("\"humi\":");
  
  if (idIndex == -1 || tempIndex == -1 || humiIndex == -1) {
    errorPackets++;
    Serial.println("数据格式错误");
    return;
  }
  
  // 解析ID
  int idStart = packet.indexOf(':', idIndex) + 1;
  int idEnd = packet.indexOf(',', idStart);
  String idStr = packet.substring(idStart, idEnd);
  
  // 解析温度
  int tempStart = packet.indexOf(':', tempIndex) + 1;
  int tempEnd = packet.indexOf(',', tempStart);
  String tempStr = packet.substring(tempStart, tempEnd);
  
  // 解析湿度
  int humiStart = packet.indexOf(':', humiIndex) + 1;
  int humiEnd = packet.indexOf(',', humiStart);
  String humiStr = packet.substring(humiStart, humiEnd);
  
  // 转换为数值
  uint32_t id = idStr.toInt();
  float temperature = tempStr.toFloat();
  float humidity = humiStr.toFloat();
  
  // 增加接收计数
  receivedPackets++;
  
  // 显示接收的数据
  Serial.print("收到数据包 #");
  Serial.print(id);
  Serial.print(" (总计: ");
  Serial.print(receivedPackets);
  Serial.print("): ");
  Serial.print(temperature, 1);
  Serial.print("°C, ");
  Serial.print(humidity, 1);
  Serial.println("%");
  
  // 控制LED指示灯
  if (temperature > TEMP_THRESHOLD) {
    digitalWrite(LED_TEMP, HIGH);  // 温度超过阈值，点亮LED
    Serial.println("⚠️ 警告：温度过高！");
  } else {
    digitalWrite(LED_TEMP, LOW);
  }
  
  if (humidity > HUMI_THRESHOLD) {
    digitalWrite(LED_HUMI, HIGH);  // 湿度超过阈值，点亮LED
    Serial.println("⚠️ 警告：湿度过高！");
  } else {
    digitalWrite(LED_HUMI, LOW);
  }
  
  // 发送确认响应
  String response = "{\"ack\":" + String(id) + ",\"received\":" + String(millis()) + "}";
  uartFromSender.println(response);
}
```

## 6. 串口调试技巧与常见问题

### 6.1 串口调试技巧
1. **使用明确的分隔符**：在数据包中使用特殊字符（如换行符）标记数据包结束
2. **添加数据包序号**：便于追踪丢失或重复的数据包
3. **使用校验和**：确保数据完整性
4. **设置超时机制**：避免程序无限等待
5. **使用JSON格式**：便于数据解析和扩展

### 6.2 常见问题排查

**问题1：串口无输出**
- 检查波特率设置是否一致
- 确认TX/RX是否交叉连接
- 检查地线是否连接
- 验证串口驱动是否正确安装

**问题2：乱码**
- 波特率不匹配
- 数据位/停止位/校验位配置不一致
- 信号干扰或线缆过长
- 电平不匹配（3.3V vs 5V）

**问题3：数据丢失**
- 缓冲区溢出（增加读取频率）
- 波特率过高（降低波特率）
- 中断冲突
- 电源不稳定

**问题4：GPS模块无数据**
- 检查接线（TX→RX，RX→TX）
- 确认GPS模块供电（3.3V）
- 连接GPS天线
- 移至开阔区域（室内通常无信号）
- 等待首次定位（冷启动可能需要几分钟）

### 6.3 调试工具推荐
1. **串口监视器**：Arduino IDE内置
2. **串口调试助手**：SSCOM、友善串口调试助手
3. **逻辑分析仪**：Saleae Logic、DSLogic
4. **示波器**：检查信号质量
5. **万用表**：测量电压和连通性

## 7. 扩展思考

### 7.1 性能优化
1. **使用DMA**：ESP32支持DMA传输，减少CPU占用
2. **中断驱动**：使用串口中断而非轮询
3. **缓冲区管理**：合理设置缓冲区大小
4. **批量发送**：减少单次发送频率

### 7.2 高级应用
1. **RS-485通信**：使用MAX485模块实现长距离通信
2. **Modbus协议**：工业设备通信标准
3. **多机通信**：使用地址寻址实现多设备通信
4. **加密通信**：对串口数据进行加密

### 7.3 实际应用场景
1. **工业控制**：PLC、传感器数据采集
2. **智能家居**：设备间通信
3. **GPS追踪器**：车辆、资产追踪
4. **调试接口**：嵌入式系统调试
5. **数据记录**：传感器数据记录和分析

## 参考资料
1. ESP32技术参考手册：https://www.espressif.com/
2. Arduino Serial库文档：https://www.arduino.cc/reference/en/language/functions/communication/serial/
3. TinyGPS++库：https://github.com/mikalhart/TinyGPSPlus
4. NEO-6M GPS模块数据手册：u-blox官方文档
5. DHT传感器库：https://github.com/adafruit/DHT-sensor-library

## 本章小结
本章我们学习了串口通信的基本原理，掌握了ESP32的三个硬件UART配置方法，实现了与计算机的双向通信、GPS数据读取和两块ESP32之间的数据传输。串口通信是嵌入式开发中最基础的通信方式，掌握它对于后续学习其他通信协议（如I2C、SPI）至关重要。

下一章我们将学习**I2C通信**，探索如何使用两根线连接多个设备。