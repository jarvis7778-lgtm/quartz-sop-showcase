# 第2章：Arduino编程基础

> 📚 **学习进度**：本章承接第1章内容，假设你已经成功让LED闪烁，并了解Arduino UNO的基本硬件。现在我们将深入Arduino编程的核心概念。

## 🎯 学习目标

完成本章后，你将能够：
1. 理解Arduino程序结构（setup/loop）
2. 使用数字和模拟输入输出
3. 掌握PWM控制LED亮度和舵机角度
4. 使用串口监视器进行调试
5. 驱动常见传感器（超声波、温湿度）
6. 编写条件判断和循环语句

## 📖 知识点讲解（30%）

### 2.1 Arduino程序结构深入

每个Arduino程序都包含两个核心函数：

```cpp
void setup() {
  // 初始化代码，只运行一次
  // 通常用于设置引脚模式、初始化串口等
}

void loop() {
  // 主循环代码，反复执行
  // 这里放置你的主要逻辑
}
```

**理解要点**：
- `setup()` 像"开机设置"——只执行一次
- `loop()` 像"无限循环的主程序"——反复执行直到断电
- Arduino启动时先执行 `setup()`，然后不断循环 `loop()`

### 2.2 数字输入输出

**数字信号**只有两种状态：HIGH（高电平，5V）或 LOW（低电平，0V）。

#### 数字输出：digitalWrite()

```cpp
pinMode(13, OUTPUT);        // 设置引脚13为输出模式
digitalWrite(13, HIGH);     // 输出高电平（5V），LED亮
digitalWrite(13, LOW);      // 输出低电平（0V），LED灭
```

#### 数字输入：digitalRead()

```cpp
pinMode(2, INPUT);          // 设置引脚2为输入模式
int buttonState = digitalRead(2);  // 读取引脚2的电平状态
// buttonState 的值为 HIGH 或 LOW
```

### 2.3 模拟输入输出

#### 模拟输入：analogRead()

Arduino UNO有6个模拟输入引脚（A0-A5），可以读取0-1023的数值（10位ADC），对应0-5V电压。

```cpp
int sensorValue = analogRead(A0);  // 读取A0引脚的模拟值
// sensorValue 范围：0-1023
// 0 = 0V，1023 = 5V
```

**重要概念**：ADC（模数转换器）将连续的模拟电压转换为离散的数字值。10位ADC有2^10 = 1024个可能值。

#### 模拟输出：analogWrite()（PWM）

Arduino的模拟输出实际上是PWM（脉冲宽度调制），通过快速开关产生等效的模拟电压。

```cpp
analogWrite(9, 127);   // 50%占空比，约2.5V等效电压
analogWrite(9, 255);   // 100%占空比，5V
analogWrite(9, 0);     // 0%占空比，0V
```

**PWM参数**：
- 范围：0-255（8位）
- 频率：约490Hz（UNO的大多数引脚）
- 只能在PWM引脚上使用（标有~符号的引脚：3,5,6,9,10,11）

### 2.4 常用C++语法

#### 变量类型

```cpp
int ledPin = 13;          // 整数（-32768 到 32767）
float temperature = 25.5; // 浮点数（带小数）
char letter = 'A';        // 单个字符
bool isOn = true;         // 布尔值（true/false）
```

#### 条件判断

```cpp
if (temperature > 30) {
  Serial.println("温度过高！");
} else if (temperature > 20) {
  Serial.println("温度适宜");
} else {
  Serial.println("温度偏低");
}
```

#### 循环语句

```cpp
// for循环：重复执行固定次数
for (int i = 0; i < 10; i++) {
  Serial.println(i);
}

// while循环：条件为真时持续执行
while (buttonState == LOW) {
  buttonState = digitalRead(2);
}
```

### 2.5 串口监视器调试

串口是Arduino与电脑通信的主要方式，用于调试和数据传输。

```cpp
void setup() {
  Serial.begin(9600);  // 初始化串口，波特率9600
}

void loop() {
  Serial.println("Hello Arduino!");  // 打印并换行
  Serial.print("数值：");             // 打印不换行
  Serial.println(analogRead(A0));    // 打印A0的读数
  delay(1000);                       // 等待1秒
}
```

**使用技巧**：
1. 打开Arduino IDE的串口监视器（右上角放大镜图标）
2. 设置正确的波特率（与代码中的Serial.begin一致）
3. 可以选择"换行"或"无换行"模式
4. 可以发送数据给Arduino（使用Serial.read()）

### 2.6 传感器基础

#### 模拟传感器 vs 数字传感器

| 类型 | 输出 | 示例 | 优点 |
|------|------|------|------|
| 模拟传感器 | 连续电压值（0-5V） | 光敏电阻、电位器、温度传感器 | 精度高，数据连续 |
| 数字传感器 | HIGH/LOW或数字信号 | 按键、超声波、红外避障 | 抗干扰强，接口简单 |

#### 常见传感器分类

1. **模拟传感器**：光敏电阻、热敏电阻、气体传感器、压力传感器
2. **数字传感器**：超声波（HC-SR04）、温湿度（DHT11）、红外接收头
3. **通信传感器**：I2C/SPI接口的复杂传感器

### 2.7 I2C/SPI通信简介

**I2C（Inter-Integrated Circuit）**：
- 只需要2根线：SDA（数据）和SCL（时钟）
- 可以连接多个设备（每个设备有唯一地址）
- 速度较慢（100kHz-400kHz）
- 适合：OLED屏幕、温湿度传感器、加速度计

**SPI（Serial Peripheral Interface）**：
- 需要4根线：MISO、MOSI、SCK、SS
- 速度更快（可达几MHz）
- 每个设备需要独立的SS引脚
- 适合：SD卡、显示屏、ADC芯片

> 📝 **注意**：I2C和SPI的详细使用将在后续章节介绍。

## 💻 代码示例（40%）

### 示例1：按键控制LED

**功能**：按下按键时LED亮，松开时LED灭。

**接线**：
- LED：D13 → 220Ω电阻 → LED正极 → LED负极 → GND
- 按键：D2 → 按键一端 → 按键另一端 → GND
- 使用内部上拉电阻，无需额外电阻

```cpp
// 示例1：按键控制LED
// 按下按键LED亮，松开LED灭

const int buttonPin = 2;    // 按键连接到数字引脚2
const int ledPin = 13;      // LED连接到数字引脚13

void setup() {
  // 初始化串口，用于调试
  Serial.begin(9600);
  
  // 设置引脚模式
  pinMode(ledPin, OUTPUT);           // LED引脚设为输出
  pinMode(buttonPin, INPUT_PULLUP);  // 按键引脚设为输入，启用内部上拉电阻
  
  Serial.println("按键控制LED程序启动");
}

void loop() {
  // 读取按键状态
  // 注意：使用INPUT_PULLUP时，按下为LOW，松开为HIGH
  int buttonState = digitalRead(buttonPin);
  
  // 根据按键状态控制LED
  if (buttonState == LOW) {
    // 按键被按下
    digitalWrite(ledPin, HIGH);  // LED亮
    Serial.println("按键按下 - LED亮");
  } else {
    // 按键松开
    digitalWrite(ledPin, LOW);   // LED灭
  }
  
  delay(50);  // 简单的去抖动延迟
}
```

### 示例2：电位器控制LED亮度

**功能**：旋转电位器控制LED亮度。

**接线**：
- 电位器：左引脚 → 5V，中间引脚 → A0，右引脚 → GND
- LED：D9（PWM引脚） → 220Ω电阻 → LED正极 → LED负极 → GND

```cpp
// 示例2：电位器控制LED亮度
// 旋转电位器改变LED亮度

const int potPin = A0;      // 电位器连接到模拟引脚A0
const int ledPin = 9;       // LED连接到PWM引脚9

void setup() {
  Serial.begin(9600);       // 初始化串口
  pinMode(ledPin, OUTPUT);  // LED引脚设为输出
  
  Serial.println("电位器控制LED亮度程序启动");
}

void loop() {
  // 读取电位器的值（0-1023）
  int potValue = analogRead(potPin);
  
  // 将0-1023映射到0-255（PWM范围）
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // 设置LED亮度
  analogWrite(ledPin, brightness);
  
  // 在串口监视器显示数值
  Serial.print("电位器值：");
  Serial.print(potValue);
  Serial.print(" → LED亮度：");
  Serial.println(brightness);
  
  delay(100);  // 稍微延迟，避免串口输出过快
}
```

### 示例3：串口通信基础

**功能**：通过串口发送命令控制LED。

```cpp
// 示例3：串口通信基础
// 通过串口发送 '1' 开灯，'0' 关灯

const int ledPin = 13;

void setup() {
  Serial.begin(9600);       // 初始化串口
  pinMode(ledPin, OUTPUT);  // LED引脚设为输出
  
  Serial.println("串口控制程序启动");
  Serial.println("发送 '1' 开灯，'0' 关灯");
}

void loop() {
  // 检查是否有串口数据
  if (Serial.available() > 0) {
    // 读取一个字符
    char command = Serial.read();
    
    // 根据命令控制LED
    if (command == '1') {
      digitalWrite(ledPin, HIGH);
      Serial.println("LED已开启");
    } else if (command == '0') {
      digitalWrite(ledPin, LOW);
      Serial.println("LED已关闭");
    } else if (command != '\n' && command != '\r') {
      // 忽略换行符，其他字符提示错误
      Serial.print("未知命令：");
      Serial.println(command);
    }
  }
}
```

### 示例4：PWM亮度阶梯测试

**功能**：测试PWM的4个亮度等级，直观感受PWM效果。

```cpp
// 示例4：PWM亮度阶梯测试
// LED亮度分4级变化：暗 → 微亮 → 半亮 → 全亮

const int ledPin = 9;  // PWM引脚

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  Serial.println("PWM亮度阶梯测试开始");
}

void loop() {
  // 定义4个亮度等级
  int brightnessLevels[] = {0, 80, 160, 255};
  const char* levelNames[] = {"关闭", "微亮", "半亮", "全亮"};
  
  // 依次测试每个亮度等级
  for (int i = 0; i < 4; i++) {
    analogWrite(ledPin, brightnessLevels[i]);
    
    Serial.print("亮度等级：");
    Serial.print(levelNames[i]);
    Serial.print(" (PWM值：");
    Serial.print(brightnessLevels[i]);
    Serial.println(")");
    
    delay(2000);  // 每个等级持续2秒
  }
}
```

## 🔧 实操项目（20%）

### 项目2.1：光敏电阻控制LED亮度

**目标**：环境越暗，LED越亮；环境越亮，LED越暗。

**材料**：
- Arduino UNO
- 光敏电阻（LDR） × 1
- 10kΩ电阻 × 1
- LED × 1
- 220Ω电阻 × 1
- 面包板和跳线

**接线**：
1. 光敏电阻：一端接5V，另一端接A0
2. 10kΩ电阻：一端接A0，另一端接GND（形成分压电路）
3. LED：D9（PWM） → 220Ω电阻 → LED正极 → LED负极 → GND

**原理**：光敏电阻的阻值随光照变化，与10kΩ电阻形成分压器，A0读取中间点的电压。

```cpp
// 项目2.1：光敏电阻控制LED亮度
// 环境越暗，LED越亮

const int ldrPin = A0;      // 光敏电阻连接到A0
const int ledPin = 9;       // LED连接到PWM引脚9

// 光照阈值（根据实际环境调整）
const int darkThreshold = 300;   // 暗的阈值
const int brightThreshold = 700; // 亮的阈值

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  
  Serial.println("光敏电阻控制LED亮度程序启动");
  Serial.println("遮挡光敏电阻观察LED变化");
}

void loop() {
  // 读取光敏电阻的值
  int lightLevel = analogRead(ldrPin);
  
  // 反向映射：光照越强，LED越暗
  // 注意：这里使用1023 - lightLevel来反转逻辑
  int brightness = map(lightLevel, 0, 1023, 255, 0);
  
  // 限制亮度范围（可选）
  brightness = constrain(brightness, 0, 255);
  
  // 设置LED亮度
  analogWrite(ledPin, brightness);
  
  // 调试信息
  Serial.print("光照强度：");
  Serial.print(lightLevel);
  Serial.print(" → LED亮度：");
  Serial.println(brightness);
  
  // 简单的状态指示
  if (lightLevel < darkThreshold) {
    Serial.println("状态：环境较暗，LED高亮");
  } else if (lightLevel > brightThreshold) {
    Serial.println("状态：环境明亮，LED低亮");
  }
  
  delay(200);  // 每200ms更新一次
}
```

### 项目2.2：电位器调节舵机角度

**目标**：旋转电位器控制舵机在0-180度之间转动。

**材料**：
- Arduino UNO
- 电位器（10kΩ） × 1
- SG90舵机 × 1
- 面包板和跳线

**接线**：
1. 电位器：左 → 5V，中 → A0，右 → GND
2. 舵机：
   - 棕色线（GND） → GND
   - 红色线（VCC） → 5V
   - 橙色线（信号） → D9

**注意**：如果舵机抖动，可能需要外接电源供电。

```cpp
// 项目2.2：电位器调节舵机角度
// 旋转电位器控制舵机角度（0-180度）

#include <Servo.h>  // 引入舵机库

Servo myServo;       // 创建舵机对象
const int potPin = A0;  // 电位器引脚

void setup() {
  Serial.begin(9600);
  
  // 将舵机连接到引脚9
  myServo.attach(9);
  
  Serial.println("电位器控制舵机程序启动");
  Serial.println("旋转电位器观察舵机角度变化");
}

void loop() {
  // 读取电位器值（0-1023）
  int potValue = analogRead(potPin);
  
  // 将电位器值映射到舵机角度（0-180）
  int angle = map(potValue, 0, 1023, 0, 180);
  
  // 控制舵机转到指定角度
  myServo.write(angle);
  
  // 显示当前角度
  Serial.print("电位器值：");
  Serial.print(potValue);
  Serial.print(" → 舵机角度：");
  Serial.print(angle);
  Serial.println("°");
  
  delay(15);  // 舵机需要时间响应，延迟15ms
}
```

### 项目2.3：超声波测距（HC-SR04）

**目标**：测量前方障碍物距离并在串口显示。

**材料**：
- Arduino UNO
- HC-SR04超声波传感器 × 1
- 面包板和跳线

**接线**：
- VCC → 5V
- Trig → D11
- Echo → D12
- GND → GND

**原理**：Trig引脚发送超声波脉冲，Echo引脚接收反射波，通过时间差计算距离。

```cpp
// 项目2.3：超声波测距（HC-SR04）
// 测量距离并在串口显示

const int trigPin = 11;  // Trig引脚
const int echoPin = 12;  // Echo引脚

void setup() {
  Serial.begin(9600);
  
  // 设置引脚模式
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  Serial.println("超声波测距程序启动");
  Serial.println("将障碍物放在传感器前方");
}

void loop() {
  // 发送超声波脉冲
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);  // 发送10微秒的高电平脉冲
  digitalWrite(trigPin, LOW);
  
  // 测量Echo引脚的高电平时间（微秒）
  long duration = pulseIn(echoPin, HIGH);
  
  // 计算距离（厘米）
  // 声速：343米/秒 = 0.0343厘米/微秒
  // 距离 = 时间 × 声速 / 2（往返）
  float distance = duration * 0.0343 / 2;
  
  // 显示距离
  Serial.print("Echo时间：");
  Serial.print(duration);
  Serial.print("微秒 → 距离：");
  
  if (distance < 2 || distance > 400) {
    Serial.println("超出测量范围");
  } else {
    Serial.print(distance);
    Serial.println("厘米");
  }
  
  delay(500);  // 每500ms测量一次
}
```

### 项目2.4：DHT11温湿度读取

**目标**：读取环境温湿度并在串口显示。

**材料**：
- Arduino UNO
- DHT11温湿度传感器 × 1
- 10kΩ电阻 × 1（如果模块没有内置）
- 面包板和跳线

**接线**（以3引脚DHT11模块为例）：
- VCC → 5V
- DATA → D2
- GND → GND

**库安装**：在Arduino IDE中安装"DHT sensor library"库（库管理器搜索DHT）。

```cpp
// 项目2.4：DHT11温湿度读取
// 读取温湿度并在串口显示

#include <DHT.h>  // 引入DHT库

#define DHTPIN 2      // DHT11数据引脚
#define DHTTYPE DHT11 // DHT类型

DHT dht(DHTPIN, DHTTYPE);  // 创建DHT对象

void setup() {
  Serial.begin(9600);
  dht.begin();  // 初始化DHT传感器
  
  Serial.println("DHT11温湿度监测程序启动");
  Serial.println("等待传感器稳定...");
  delay(2000);  // DHT11需要2秒稳定时间
}

void loop() {
  // 读取湿度和温度
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();  // 摄氏度
  
  // 检查读取是否成功
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("读取DHT11失败！");
    return;
  }
  
  // 计算体感温度（热指数）
  float heatIndex = dht.computeHeatIndex(temperature, humidity, false);
  
  // 显示数据
  Serial.println("=== 温湿度监测 ===");
  Serial.print("湿度：");
  Serial.print(humidity);
  Serial.println(" %");
  
  Serial.print("温度：");
  Serial.print(temperature);
  Serial.println(" °C");
  
  Serial.print("体感温度：");
  Serial.print(heatIndex);
  Serial.println(" °C");
  
  // 简单的舒适度判断
  if (temperature < 18) {
    Serial.println("感觉：偏冷");
  } else if (temperature < 26) {
    Serial.println("感觉：舒适");
  } else if (temperature < 32) {
    Serial.println("感觉：偏热");
  } else {
    Serial.println("感觉：炎热");
  }
  
  Serial.println();  // 空行分隔
  
  delay(2000);  // DHT11采样间隔至少1秒
}
```

## 🔍 调试技巧（10%）

### 串口监视器高级用法

1. **格式化输出**：
```cpp
// 对齐输出
Serial.print("温度：");
Serial.print(temperature, 1);  // 保留1位小数
Serial.println("°C");

// 十六进制输出
Serial.print("数值(HEX)：0x");
Serial.println(value, HEX);
```

2. **调试宏**：
```cpp
#define DEBUG  // 定义调试宏

#ifdef DEBUG
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

void loop() {
  int value = analogRead(A0);
  DEBUG_PRINT("A0读数：");
  DEBUG_PRINTLN(value);
}
```

3. **性能测量**：
```cpp
unsigned long startTime = millis();  // 记录开始时间

// 执行需要测量的代码

unsigned long elapsed = millis() - startTime;
Serial.print("执行时间：");
Serial.print(elapsed);
Serial.println("ms");
```

### 常见编译错误排查

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `expected ';' before '}'` | 缺少分号 | 检查语句结尾是否有分号 |
| `'xxx' was not declared` | 变量/函数未定义 | 检查拼写，确保在使用前定义 |
| `too many arguments` | 函数参数过多 | 检查函数调用参数数量 |
| `invalid conversion` | 类型不匹配 | 检查变量类型是否正确 |
| `undefined reference to` | 库未正确包含 | 检查#include语句和库安装 |

### 接线检查清单

在通电前，务必检查：

1. **电源检查**：
   - □ 5V和GND没有接反
   - □ 电源电流足够（特别是驱动电机/舵机时）
   - □ 没有短路（用万用表检查）

2. **引脚检查**：
   - □ 数字/模拟引脚是否正确
   - □ PWM引脚是否支持（标有~的引脚）
   - □ 输入/输出模式是否设置正确

3. **传感器检查**：
   - □ VCC和GND是否正确
   - □ 信号线是否连接到正确的引脚
   - □ 是否需要上拉/下拉电阻

4. **常见问题**：
   - □ 按键抖动：添加去抖动代码或电容
   - □ 舵机抖动：检查电源是否足够
   - □ 串口乱码：波特率是否匹配

## 📚 总结与扩展

### 本章要点回顾

1. **程序结构**：setup()初始化，loop()主循环
2. **数字IO**：digitalRead/digitalWrite处理开关信号
3. **模拟IO**：analogRead读取连续值，analogWrite输出PWM
4. **调试工具**：串口监视器是最重要的调试工具
5. **传感器驱动**：模拟传感器用电压分压，数字传感器用特定时序

### 扩展思考

1. **如何同时控制多个LED实现流水灯效果？**
   - 提示：使用数组和for循环

2. **如何用超声波实现简单的避障小车？**
   - 提示：结合电机驱动模块

3. **如何将传感器数据保存到EEPROM？**
   - 提示：使用EEPROM库

4. **如何实现手机蓝牙控制Arduino？**
   - 提示：使用HC-05蓝牙模块

### 下一步学习

第3章我们将学习：
- 中断处理（attachInterrupt）
- 定时器的使用
- 更复杂的传感器数据处理
- 多任务处理（millis替代delay）

> 💡 **学习建议**：每个项目都自己动手实现一遍，修改参数观察变化，这是掌握Arduino编程的最好方法。

## 📖 参考资源

1. Arduino官方文档：https://www.arduino.cc/reference/en/
2. 太极创客Arduino教程：http://www.taichi-maker.com/
3. Arduino PWM详解：https://controllerstech.com/arduino-pwm-analogwrite-tutorial/
4. HC-SR04超声波指南：https://www.qutaojiao.com/24203.html
5. DHT11传感器使用：https://edu.51cto.com/article/note/32684.html

---

*本教程基于Arduino IDE 2.x版本编写，代码兼容Arduino UNO、Nano、Mega等常见开发板。*