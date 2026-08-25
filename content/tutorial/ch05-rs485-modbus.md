# 第5章：RS485 工业通信

> **前置说明**：本章适合有工业控制/仪表通信需求的学习者。如果只做智能家居可跳过，直接学第6章MQTT。

## 学习目标

学完本章，你将能够：
- 理解RS485差分信号原理及与UART/RS232的区别
- 掌握MAX485芯片的DE/RE方向控制
- 理解Modbus RTU协议帧格式和CRC校验
- 用ESP32实现RS485一主多从通信
- 读取Modbus电能表（SDM120）数据

---

## 5.1 RS485 vs UART vs RS232

### 为什么要用RS485？

前面我们学的UART是**TTL电平**（0V/3.3V或0V/5V），适合板间短距离通信。但在工厂、楼宇等场景，通信距离可能几十米到几百米，TTL信号会被噪声淹没。

**RS485**使用**差分信号**——用A和B两根线之间的电压差来表示0和1，抗干扰能力极强。

| 特性 | UART (TTL) | RS232 | RS485 |
|------|-----------|-------|-------|
| 信号方式 | 单端（对GND） | 单端（对GND） | 差分（A-B） |
| 逻辑电平 | 0V/3.3V | ±3V~±15V | A-B差分 ±200mV |
| 最大距离 | ~1米 | ~15米 | ~1200米 |
| 最大速率 | 1Mbps+ | 20kbps | 10Mbps |
| 设备数量 | 1对1 | 1对1 | 1对32（可扩展到256） |
| 通信方式 | 全双工 | 全双工 | 半双工 |
| 抗干扰能力 | 弱 | 中等 | 强 |

**一句话总结**：距离近用UART，距离远/工业环境用RS485。

---

## 5.2 MAX485芯片工作原理

### MAX485是什么？

MAX485是一个TTL转RS485的电平转换芯片。ESP32说TTL语言，RS485设备说RS485语言，MAX485是翻译官。

### 引脚功能

```
         ┌─────────────┐
    RO ──┤1         8├── VCC (5V)
    RE ──┤2         7├── B
    DE ──┤3         6├── A
   GND ──┤4         5├── DI
         └─────────────┘

RO  = Receive Output（接收输出，接ESP32的RX）
DI  = Driver Input（驱动输入，接ESP32的TX）
DE  = Driver Enable（驱动使能，高电平=发送模式）
RE  = Receive Enable（接收使能，低电平=接收模式）
A/B = RS485差分信号线
```

### DE/RE控制逻辑

| DE | RE | 模式 |
|----|----|------|
| 1  | 0/1 | 发送模式（DI→A/B） |
| 0  | 0  | 接收模式（A/B→RO） |

**关键点**：DE和RE通常连在一起，用一个GPIO控制：
- GPIO高电平 → 发送模式
- GPIO低电平 → 接收模式

---

## 5.3 RS485接线规范

### 基本接线

```
ESP32                 MAX485模块
─────                 ──────────
5V   ──────────────── VCC
GND  ──────────────── GND
GPIO17 (TX1) ──────── DI
GPIO16 (RX1) ──────── RO
GPIO4  ────────────── DE+RE（方向控制）

MAX485模块             另一个MAX485模块
─────────              ─────────
A  ────────────────── A（A对A）
B  ────────────────── B（B对B）
GND ───────────────── GND（共地）
```

### 注意事项

1. **A对A，B对B**——接反了通信不通，但不会烧芯片
2. **终端电阻**：距离超过50米时，在总线两端各加120Ω电阻（A-B之间）
3. **屏蔽双绞线**：推荐使用，屏蔽层单端接地
4. **共地**：所有设备GND必须连接

---

## 5.4 Modbus RTU协议基础

### 什么是Modbus？

Modbus是一种主从式通信协议，定义了"怎么问、怎么答"。就像打电话：
- **主机**（Master）拨号提问
- **从机**（Slave）接听回答

### 帧格式

```
请求帧：[从机地址 1B] [功能码 1B] [数据 NB] [CRC16 2B]
响应帧：[从机地址 1B] [功能码 1B] [数据 NB] [CRC16 2B]
```

### 常用功能码

| 功能码 | 名称 | 用途 |
|--------|------|------|
| 0x01 | 读线圈 | 读取开关量（ON/OFF） |
| 0x02 | 读离散输入 | 读取外部开关状态 |
| 0x03 | 读保持寄存器 | 读取配置参数 |
| 0x04 | 读输入寄存器 | 读取传感器数据 |
| 0x05 | 写单个线圈 | 控制单个开关 |
| 0x06 | 写单个寄存器 | 修改单个参数 |
| 0x10 | 写多个寄存器 | 批量修改参数 |

### CRC16校验

CRC16是Modbus RTU的错误检测机制。发送方计算CRC并附加在帧尾，接收方重新计算并比对。

```cpp
// CRC16-Modbus 计算函数
uint16_t calcCRC(uint8_t *data, uint8_t length) {
    uint16_t crc = 0xFFFF;
    for (uint8_t i = 0; i < length; i++) {
        crc ^= data[i];
        for (uint8_t j = 0; j < 8; j++) {
            if (crc & 0x0001) {
                crc >>= 1;
                crc ^= 0xA001;
            } else {
                crc >>= 1;
            }
        }
    }
    return crc;  // 低字节在前
}
```

---

## 5.5 ESP32 UART RS485模式

ESP32的ESP-IDF原生支持RS485半双工模式：

```cpp
// Arduino框架下使用HardwareSerial
#include <HardwareSerial.h>

HardwareSerial RS485Serial(1);  // 使用UART1

#define RS485_RX_PIN 16
#define RS485_TX_PIN 17
#define RS485_DE_PIN 4   // 方向控制引脚

void setup() {
    Serial.begin(115200);
    
    // 初始化RS485串口（9600波特率，8N1）
    RS485Serial.begin(9600, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
    
    pinMode(RS485_DE_PIN, OUTPUT);
    digitalWrite(RS485_DE_PIN, LOW);  // 默认接收模式
}

// 发送数据前切换为发送模式
void rs485Send(uint8_t *data, uint8_t len) {
    digitalWrite(RS485_DE_PIN, HIGH);  // 切换到发送模式
    delayMicroseconds(10);             // 短暂延时确保芯片切换
    RS485Serial.write(data, len);
    RS485Serial.flush();               // 等待发送完成
    delayMicroseconds(10);
    digitalWrite(RS485_DE_PIN, LOW);   // 切回接收模式
}
```

---

## 项目5.1：ESP32 + MAX485 回环测试

### 目标
验证MAX485模块能正常收发数据。

### 硬件接线
```
ESP32          MAX485模块
─────          ──────────
5V    ──────── VCC
GND   ──────── GND
GPIO17 ─────── DI
GPIO16 ─────── RO
GPIO4  ─────── DE+RE

将MAX485的A和B短接（回环测试）
```

### 代码

```cpp
#include <HardwareSerial.h>

HardwareSerial RS485Serial(1);

#define RS485_RX_PIN 16
#define RS485_TX_PIN 17
#define RS485_DE_PIN 4

void setup() {
    Serial.begin(115200);
    RS485Serial.begin(9600, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
    pinMode(RS485_DE_PIN, OUTPUT);
    digitalWrite(RS485_DE_PIN, LOW);
    
    Serial.println("RS485 回环测试开始...");
}

void loop() {
    // 发送测试数据
    String testMsg = "Hello RS485!\n";
    
    Serial.print("发送: " + testMsg);
    
    // 切换到发送模式
    digitalWrite(RS485_DE_PIN, HIGH);
    delayMicroseconds(10);
    RS485Serial.print(testMsg);
    RS485Serial.flush();
    delayMicroseconds(10);
    digitalWrite(RS485_DE_PIN, LOW);
    
    // 等待接收（因为A-B短接，会收到自己发的数据）
    delay(100);
    
    if (RS485Serial.available()) {
        Serial.print("接收: ");
        while (RS485Serial.available()) {
            Serial.write(RS485Serial.read());
        }
    } else {
        Serial.println("接收超时");
    }
    
    Serial.println("---");
    delay(2000);
}
```

### 预期结果
```
发送: Hello RS485!
接收: Hello RS485!
---
```

---

## 项目5.2：RS485 一主两从通信

### 目标
一个ESP32作为主机，两个ESP32作为从机，实现轮询通信。

### 硬件
- 3个ESP32 + 3个MAX485模块
- A对A、B对B串联

### 主机代码

```cpp
#include <HardwareSerial.h>

HardwareSerial RS485Serial(1);
#define RS485_DE_PIN 4

// 从机地址
#define SLAVE1_ADDR 0x01
#define SLAVE2_ADDR 0x02

void setup() {
    Serial.begin(115200);
    RS485Serial.begin(9600, SERIAL_8N1, 16, 17);
    pinMode(RS485_DE_PIN, OUTPUT);
    digitalWrite(RS485_DE_PIN, LOW);
}

// 发送查询命令并等待响应
bool querySlave(uint8_t addr) {
    uint8_t cmd[4] = {addr, 0x03, 0x00, 0x01};  // 简化命令
    uint16_t crc = calcCRC(cmd, 4);
    
    // 发送
    digitalWrite(RS485_DE_PIN, HIGH);
    delayMicroseconds(10);
    RS485Serial.write(cmd, 4);
    RS485Serial.write(crc & 0xFF);       // CRC低字节
    RS485Serial.write(crc >> 8);         // CRC高字节
    RS485Serial.flush();
    delayMicroseconds(10);
    digitalWrite(RS485_DE_PIN, LOW);
    
    // 等待响应
    unsigned long startTime = millis();
    while (!RS485Serial.available()) {
        if (millis() - startTime > 500) {
            Serial.printf("从机%d 响应超时\n", addr);
            return false;
        }
    }
    
    // 读取响应
    Serial.printf("从机%d 响应: ", addr);
    while (RS485Serial.available()) {
        Serial.printf("%02X ", RS485Serial.read());
    }
    Serial.println();
    return true;
}

void loop() {
    querySlave(SLAVE1_ADDR);
    delay(1000);
    querySlave(SLAVE2_ADDR);
    delay(1000);
}
```

---

## 项目5.3：ESP32 读取 SDM120 电能表数据

### SDM120简介
SDM120是一款单相电能表，通过Modbus RTU（RS485）输出数据。

### 常用寄存器地址

| 参数 | 寄存器地址 | 数据类型 |
|------|-----------|---------|
| 电压 | 0x0000 | Float |
| 电流 | 0x0006 | Float |
| 有功功率 | 0x000C | Float |
| 视在功率 | 0x0012 | Float |
| 功率因数 | 0x001E | Float |
| 频率 | 0x0046 | Float |
| 总电能 | 0x0156 | Float |

### 代码

```cpp
#include <HardwareSerial.h>

HardwareSerial RS485Serial(1);
#define RS485_DE_PIN 4
#define SDM120_ADDR 0x01  // SDM120默认地址

// 发送Modbus请求并读取响应
bool readModbusFloat(uint16_t regAddr, float &value) {
    uint8_t request[8];
    request[0] = SDM120_ADDR;      // 从机地址
    request[1] = 0x04;             // 功能码04（读输入寄存器）
    request[2] = regAddr >> 8;     // 寄存器地址高字节
    request[3] = regAddr & 0xFF;   // 寄存器地址低字节
    request[4] = 0x00;             // 读取数量高字节
    request[5] = 0x02;             // 读取数量低字节（2个寄存器=4字节）
    
    // 计算CRC
    uint16_t crc = calcCRC(request, 6);
    request[6] = crc & 0xFF;
    request[7] = crc >> 8;
    
    // 发送
    digitalWrite(RS485_DE_PIN, HIGH);
    delayMicroseconds(10);
    RS485Serial.write(request, 8);
    RS485Serial.flush();
    delayMicroseconds(10);
    digitalWrite(RS485_DE_PIN, LOW);
    
    // 等待响应
    delay(100);
    if (RS485Serial.available() < 9) return false;
    
    // 读取响应
    uint8_t response[9];
    for (int i = 0; i < 9; i++) {
        response[i] = RS485Serial.read();
    }
    
    // 解析Float（IEEE 754，大端序）
    uint8_t bytes[4] = {response[3], response[4], response[5], response[6]};
    memcpy(&value, bytes, 4);
    return true;
}

void setup() {
    Serial.begin(115200);
    RS485Serial.begin(9600, SERIAL_8N1, 16, 17);
    pinMode(RS485_DE_PIN, OUTPUT);
    digitalWrite(RS485_DE_PIN, LOW);
    
    Serial.println("SDM120 电能表读取测试");
}

void loop() {
    float voltage, current, power, energy;
    
    Serial.println("====== SDM120 数据 ======");
    
    if (readModbusFloat(0x0000, voltage))
        Serial.printf("电压: %.1f V\n", voltage);
    
    if (readModbusFloat(0x0006, current))
        Serial.printf("电流: %.3f A\n", current);
    
    if (readModbusFloat(0x000C, power))
        Serial.printf("有功功率: %.1f W\n", power);
    
    if (readModbusFloat(0x0156, energy))
        Serial.printf("总电能: %.2f kWh\n", energy);
    
    Serial.println();
    delay(3000);
}
```

---

## 扩展思考

1. **如何调试RS485通信？**
   - 用USB-TTL+MAX485在电脑上用串口助手测试
   - 用逻辑分析仪查看A/B波形
   - 先确认接线正确，再排查协议问题

2. **常见故障排查**
   - A/B接反：通信完全无响应，交换A/B
   - 波特率不匹配：能收到数据但乱码
   - 地址冲突：多个从机地址相同会导致数据混乱

3. **下一步学习**
   - Modbus TCP（基于以太网的Modbus）
   - CAN总线（汽车/工业控制常用）
   - 工业协议（OPC UA、MQTT Sparkplug）
