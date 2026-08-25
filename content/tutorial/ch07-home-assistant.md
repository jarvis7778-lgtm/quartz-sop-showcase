# 第7章：Home Assistant智能家居平台

## 学习目标

通过本章学习，您将能够：

1. 理解Home Assistant开源智能家居平台的核心概念
2. 掌握在树莓派5上安装Home Assistant OS的方法
3. 学会使用ESPHome快速创建智能传感器节点
4. 配置Home Assistant与MQTT的集成
5. 编写Home Assistant自动化规则实现智能控制
6. 完成一个完整的智能家居温度监控与自动控制项目

## 7.1 Home Assistant简介

### 7.1.1 什么是Home Assistant？

Home Assistant是一个开源的智能家居平台，它可以将不同品牌、不同协议的智能设备统一管理。就像一个"智能家居的翻译官"，让小米的灯泡、飞利浦的开关、ESP32的传感器都能协同工作。

**核心特点：**
- **本地化运行**：所有数据都在您自己的服务器上，保护隐私
- **开源免费**：社区驱动，持续更新
- **高度可定制**：通过YAML配置文件实现各种功能
- **丰富的集成**：支持2000+种设备和平台

### 7.1.2 Home Assistant的版本选择

Home Assistant有四个版本，适合不同需求：

| 版本 | 特点 | 适用场景 |
|------|------|----------|
| **HA OS** | 完整的操作系统，包含所有功能 | 树莓派、虚拟机（推荐新手） |
| **HA Container** | Docker容器版本 | Linux服务器、NAS |
| **HA Core** | 纯Python版本 | 高级用户、开发环境 |
| **HA Supervised** | 在已有Linux系统上安装 | 需要同时运行其他服务的用户 |

**本教程推荐使用HA OS版本**，它是最简单、最完整的解决方案。

### 7.1.3 Home Assistant的核心概念

在使用Home Assistant之前，需要理解几个核心概念：

1. **Entity（实体）**：智能家居中的基本单位，如一个灯泡、一个传感器
2. **Device（设备）**：物理设备，可能包含多个Entity
3. **Integration（集成）**：连接不同平台/协议的模块
4. **Automation（自动化）**：基于条件触发的自动操作
5. **Service（服务）**：可以调用的操作，如开灯、关灯

## 7.2 安装Home Assistant

### 7.2.1 准备工作

**硬件要求：**
- 树莓派5（推荐4GB以上内存版本）
- 32GB以上microSD卡（推荐A2级别）
- 5V/3A电源适配器
- 网线（推荐）或WiFi连接

**软件要求：**
- Raspberry Pi Imager（烧录工具）
- Home Assistant OS镜像文件

### 7.2.2 项目7.1：树莓派5安装Home Assistant OS

**步骤1：下载镜像文件**

访问Home Assistant官网下载树莓派5专用镜像：
```bash
# 或者使用命令行下载（Linux/macOS）
wget https://github.com/home-assistant/operating-system/releases/download/12.4/haos_rpi5-64-12.4.img.xz
```

**步骤2：烧录镜像到SD卡**

1. 安装Raspberry Pi Imager
2. 选择"Use custom image"，选择下载的HAOS镜像
3. 选择SD卡设备
4. 点击"Write"开始烧录

**步骤3：启动和初始配置**

1. 将烧录好的SD卡插入树莓派5
2. 连接网线和电源
3. 等待3-5分钟启动完成
4. 在浏览器访问 `http://homeassistant.local:8123` 或 `http://[树莓派IP]:8123`

**步骤4：创建管理员账户**

1. 首次访问会显示欢迎页面
2. 点击"Create Account"创建管理员账户
3. 填写用户名、密码、邮箱等信息
4. 设置家庭位置（用于天气、日出日落等功能）

**步骤5：基本设置**

1. 设置家庭名称和位置
2. 选择时区（亚洲/上海）
3. 选择单位系统（公制）
4. 完成初始设置向导

## 7.3 ESPHome入门

### 7.3.1 什么是ESPHome？

ESPHome是一个固件生成器，它通过简单的YAML配置文件，自动为ESP32/ESP8266生成固件。您不需要编写C代码，只需要描述设备的功能，ESPHome就会自动生成可运行的固件。

**ESPHome的优势：**
- **零编程**：YAML配置，自动生成固件
- **无缝集成**：与Home Assistant自动配对
- **OTA更新**：无线更新固件
- **丰富的组件**：支持数百种传感器和执行器

### 7.3.2 安装ESPHome

在Home Assistant中安装ESPHome非常简单：

1. 打开Home Assistant网页界面
2. 进入"设置" → "加载项" → "加载项商店"
3. 搜索"ESPHome"并点击安装
4. 安装完成后点击"启动"
5. 点击"打开Web UI"进入ESPHome界面

### 7.3.3 ESPHome配置文件结构

一个典型的ESPHome配置文件包含以下部分：

```yaml
# 基本设备信息
esphome:
  name: my_sensor          # 设备名称
  platform: ESP32          # 平台类型
  board: nodemcu-32s       # 开发板型号

# WiFi配置
wifi:
  ssid: "YourWiFi"         # WiFi名称
  password: "password"     # WiFi密码

# 启用日志
logger:

# 启用Home Assistant API
api:

# 启用OTA更新
ota:

# 传感器配置
sensor:
  - platform: dht
    pin: GPIO4
    temperature:
      name: "Living Room Temperature"
    humidity:
      name: "Living Room Humidity"
    update_interval: 60s
```

### 7.3.4 ESPHome常用组件

**传感器组件（sensor）：**
- `dht`：温湿度传感器（DHT11/DHT22）
- `bmp280`：气压温度传感器
- `bh1750`：光照传感器
- `adc`：模拟输入传感器

**开关组件（switch）：**
- `gpio`：GPIO开关控制
- `restart`：设备重启开关
- `template`：模板开关

**二进制传感器（binary_sensor）：**
- `gpio`：GPIO输入状态
- `status`：设备在线状态
- `template`：模板二进制传感器

## 7.4 项目7.2：ESPHome制作温湿度传感器节点

### 7.4.1 硬件准备

**所需材料：**
- ESP32开发板（NodeMCU-32S或类似）
- DHT22温湿度传感器
- 杜邦线若干
- 面包板（可选）

**接线方式：**
```
DHT22传感器 → ESP32
VCC → 3.3V
DATA → GPIO4
GND → GND
```

### 7.4.2 创建ESPHome配置

在ESPHome界面中，点击"NEW DEVICE"创建新设备：

1. 输入设备名称：`living_room_sensor`
2. 选择设备类型：ESP32
3. 输入WiFi信息
4. 保存配置

然后点击"EDIT"编辑YAML配置文件：

```yaml
# 基本设备配置
esphome:
  name: living_room_sensor    # 设备名称
  platform: ESP32             # 平台：ESP32
  board: nodemcu-32s          # 开发板型号

# WiFi配置
wifi:
  ssid: "YourWiFiSSID"        # 替换为您的WiFi名称
  password: "YourWiFiPassword" # 替换为您的WiFi密码
  
  # 可选：设置静态IP
  manual_ip:
    static_ip: 192.168.1.100
    gateway: 192.168.1.1
    subnet: 255.255.255.0

# 启用日志记录
logger:
  level: DEBUG  # 设置日志级别

# 启用Home Assistant API
api:
  password: "APassword123"  # API访问密码

# 启用OTA无线更新
ota:
  password: "OTAPassword123"  # OTA更新密码

# 设备状态传感器（显示设备是否在线）
binary_sensor:
  - platform: status
    name: "Living Room Sensor Status"

# DHT22温湿度传感器配置
sensor:
  - platform: dht           # DHT系列传感器
    pin: GPIO4              # 数据引脚连接到GPIO4
    model: DHT22            # 传感器型号：DHT22
    temperature:            # 温度传感器配置
      name: "Living Room Temperature"  # 在HA中显示的名称
      unit_of_measurement: "°C"        # 单位：摄氏度
      accuracy_decimals: 1             # 小数位数
    humidity:               # 湿度传感器配置
      name: "Living Room Humidity"     # 在HA中显示的名称
      unit_of_measurement: "%"         # 单位：百分比
      accuracy_decimals: 1             # 小数位数
    update_interval: 30s    # 更新间隔：30秒

# WiFi信号强度传感器
sensor:
  - platform: wifi_signal
    name: "Living Room WiFi Signal"
    update_interval: 60s

# 设备重启开关（用于远程重启）
switch:
  - platform: restart
    name: "Living Room Sensor Restart"

# 文本传感器（显示设备信息）
text_sensor:
  - platform: wifi_info
    ip_address:
      name: "Living Room Sensor IP"
    ssid:
      name: "Living Room Sensor SSID"
```

### 7.4.3 编译和上传固件

1. 点击"INSTALL"按钮
2. 选择安装方式：
   - **Wirelessly**：无线安装（设备需要已经刷入ESPHome固件）
   - **Plug into this computer**：通过USB连接电脑
   - **Manual download**：手动下载固件文件

3. 首次安装推荐选择"Plug into this computer"
4. 连接ESP32到电脑，选择对应的串口
5. 等待编译和上传完成

### 7.4.4 在Home Assistant中添加设备

固件上传成功后，设备会自动出现在Home Assistant中：

1. 进入Home Assistant的"设置" → "设备与服务"
2. 点击"集成"，找到"ESPHome"
3. 点击"添加集成"
4. 输入ESP32的IP地址或主机名
5. 输入API密码（如果设置了的话）
6. 完成添加

添加成功后，您可以在"设备"页面看到新添加的传感器，包含：
- 温度传感器
- 湿度传感器
- WiFi信号强度
- 设备状态

## 7.5 Home Assistant自动化

### 7.5.1 自动化基本概念

Home Assistant的自动化由三个部分组成：

1. **触发器（Trigger）**：什么条件下启动自动化
   - 时间触发
   - 设备状态变化触发
   - 传感器数值触发
   - 手动触发

2. **条件（Condition）**：触发后需要满足的条件
   - 时间条件
   - 设备状态条件
   - 数值范围条件

3. **动作（Action）**：满足条件后执行的操作
   - 控制设备开关
   - 发送通知
   - 调用服务
   - 执行脚本

### 7.5.2 自动化配置方式

Home Assistant支持两种配置方式：

**方式1：UI界面配置（推荐新手）**
1. 进入"设置" → "自动化与场景"
2. 点击"创建自动化"
3. 选择"创建自动化"
4. 通过界面设置触发器、条件和动作

**方式2：YAML文件配置（推荐高级用户）**
```yaml
# 配置文件：automations.yaml
- id: '1234567890'
  alias: "温度过高报警"
  description: "当温度超过30度时发送通知"
  trigger:
    - platform: numeric_state
      entity_id: sensor.living_room_temperature
      above: 30
  condition:
    - condition: time
      after: "08:00:00"
      before: "22:00:00"
  action:
    - service: notify.notify
      data:
        message: "客厅温度过高：{{ states('sensor.living_room_temperature') }}°C"
    - service: light.turn_on
      target:
        entity_id: light.warning_light
      data:
        color_name: "red"
```

### 7.5.3 项目7.3：温度超过阈值自动打开风扇

**场景描述：**
当客厅温度超过28°C时，自动打开风扇；当温度降到25°C以下时，自动关闭风扇。

**硬件准备：**
- 已接入Home Assistant的温度传感器（如项目7.2的ESP32温湿度传感器）
- 智能插座或继电器模块（控制风扇电源）

**步骤1：创建自动化规则**

进入Home Assistant的"设置" → "自动化与场景" → "创建自动化"

**步骤2：设置触发器**

选择"数值状态"触发器：
- 实体：`sensor.living_room_temperature`
- 超过：28

**步骤3：设置条件（可选）**

添加时间条件，避免夜间触发：
- 条件类型：时间
- 之后：08:00:00
- 之前：22:00:00

**步骤4：设置动作**

添加"调用服务"动作：
- 服务：`switch.turn_on`
- 目标实体：`switch.fan_switch`（您的风扇开关实体）

**步骤5：创建关闭风扇的自动化**

重复以上步骤，创建另一个自动化：
- 触发器：温度低于25°C
- 动作：关闭风扇开关

**完整YAML配置（参考）：**

```yaml
# 自动化1：温度过高打开风扇
- id: 'temp_high_fan_on'
  alias: "高温自动开风扇"
  description: "当温度超过28度时自动打开风扇"
  trigger:
    - platform: numeric_state
      entity_id: sensor.living_room_temperature
      above: 28
  condition:
    - condition: time
      after: "08:00:00"
      before: "22:00:00"
    - condition: state
      entity_id: switch.fan_switch
      state: 'off'  # 只有风扇关闭时才触发
  action:
    - service: switch.turn_on
      target:
        entity_id: switch.fan_switch
    - service: notify.notify
      data:
        title: "智能家居通知"
        message: "温度已达到{{ states('sensor.living_room_temperature') }}°C，风扇已自动开启"

# 自动化2：温度降低关闭风扇
- id: 'temp_low_fan_off'
  alias: "低温自动关风扇"
  description: "当温度低于25度时自动关闭风扇"
  trigger:
    - platform: numeric_state
      entity_id: sensor.living_room_temperature
      below: 25
  condition:
    - condition: state
      entity_id: switch.fan_switch
      state: 'on'  # 只有风扇开启时才触发
  action:
    - service: switch.turn_off
      target:
        entity_id: switch.fan_switch
    - service: notify.notify
      data:
        title: "智能家居通知"
        message: "温度已降至{{ states('sensor.living_room_temperature') }}°C，风扇已自动关闭"
```

## 7.6 Home Assistant + MQTT集成

### 7.6.1 安装MQTT Broker

在Home Assistant中安装Mosquitto MQTT Broker：

1. 进入"设置" → "加载项" → "加载项商店"
2. 搜索"MQTT"并选择"Mosquitto broker"
3. 点击"安装"
4. 安装完成后点击"启动"
5. 在"配置"选项卡中设置用户名和密码

### 7.6.2 配置MQTT集成

1. 进入"设置" → "设备与服务"
2. 点击"添加集成"
3. 搜索"MQTT"
4. 输入MQTT Broker信息：
   - 主机：`localhost`（如果MQTT安装在HA中）
   - 端口：1883
   - 用户名/密码：在Mosquitto中设置的凭据

### 7.6.3 MQTT传感器配置

在`configuration.yaml`中添加MQTT传感器：

```yaml
# MQTT传感器配置
mqtt:
  sensor:
    # 温度传感器
    - name: "MQTT Temperature"
      state_topic: "home/living_room/temperature"
      unit_of_measurement: "°C"
      value_template: "{{ value }}"
      unique_id: "mqtt_temp_001"
      
    # 湿度传感器
    - name: "MQTT Humidity"
      state_topic: "home/living_room/humidity"
      unit_of_measurement: "%"
      value_template: "{{ value }}"
      unique_id: "mqtt_humidity_001"
      
  # 开关
  switch:
    - name: "MQTT Fan Switch"
      state_topic: "home/fan/state"
      command_topic: "home/fan/set"
      payload_on: "ON"
      payload_off: "OFF"
      state_on: "ON"
      state_off: "OFF"
      optimistic: false
      unique_id: "mqtt_fan_001"
```

### 7.6.4 项目7.4：ESP32通过MQTT接入HA（不用ESPHome的替代方案）

对于不想使用ESPHome的用户，可以直接用Arduino代码实现MQTT通信。

**Arduino代码示例：**

```cpp
/*
 * ESP32 MQTT温湿度传感器 - 直接Arduino实现
 * 功能：读取DHT22传感器数据，通过MQTT发送到Home Assistant
 */

#include <WiFi.h>           // WiFi库
#include <PubSubClient.h>   // MQTT客户端库
#include <DHT.h>            // DHT传感器库

// WiFi配置
const char* ssid = "YourWiFiSSID";         // WiFi名称
const char* password = "YourWiFiPassword"; // WiFi密码

// MQTT配置
const char* mqtt_server = "192.168.1.100"; // MQTT服务器地址（Home Assistant IP）
const int mqtt_port = 1883;                // MQTT端口
const char* mqtt_user = "mqtt_user";       // MQTT用户名
const char* mqtt_pass = "mqtt_pass";       // MQTT密码

// MQTT主题定义
const char* temp_topic = "home/living_room/temperature";  // 温度主题
const char* humi_topic = "home/living_room/humidity";     // 湿度主题
const char* status_topic = "home/living_room/status";     // 状态主题

// DHT传感器配置
#define DHTPIN 4          // DHT数据引脚
#define DHTTYPE DHT22     // DHT类型：DHT22

// 创建对象
DHT dht(DHTPIN, DHTTYPE);      // DHT传感器对象
WiFiClient espClient;           // WiFi客户端对象
PubSubClient client(espClient); // MQTT客户端对象

// 时间控制变量
unsigned long lastMsg = 0;      // 上次发送消息时间
const long interval = 30000;    // 发送间隔：30秒

void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  Serial.println("ESP32 MQTT温湿度传感器启动...");
  
  // 初始化DHT传感器
  dht.begin();
  Serial.println("DHT传感器初始化完成");
  
  // 连接WiFi
  setup_wifi();
  
  // 配置MQTT服务器
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  Serial.println("初始化完成，开始主循环");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("连接到WiFi: ");
  Serial.println(ssid);
  
  // 开始连接WiFi
  WiFi.begin(ssid, password);
  
  // 等待连接
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi连接成功");
  Serial.print("IP地址: ");
  Serial.println(WiFi.localIP());
}

// MQTT消息回调函数
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("收到消息 [");
  Serial.print(topic);
  Serial.print("] ");
  
  // 打印消息内容
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
  // 这里可以处理接收到的MQTT消息
  // 例如控制继电器等
}

// 重新连接MQTT服务器
void reconnect() {
  // 循环直到连接成功
  while (!client.connected()) {
    Serial.print("尝试MQTT连接...");
    
    // 创建客户端ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // 尝试连接
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("连接成功");
      
      // 发布上线消息
      client.publish(status_topic, "online");
      
      // 订阅主题（如果需要接收控制命令）
      // client.subscribe("home/living_room/control");
    } else {
      Serial.print("失败，rc=");
      Serial.print(client.state());
      Serial.println("，5秒后重试");
      delay(5000);
    }
  }
}

void loop() {
  // 检查MQTT连接
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // 定时读取和发送数据
  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    
    // 读取温湿度数据
    float temperature = dht.readTemperature();  // 读取温度（摄氏度）
    float humidity = dht.readHumidity();        // 读取湿度（百分比）
    
    // 检查读取是否成功
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("读取DHT传感器失败！");
      return;
    }
    
    // 打印到串口监视器
    Serial.print("温度: ");
    Serial.print(temperature);
    Serial.print("°C, 湿度: ");
    Serial.print(humidity);
    Serial.println("%");
    
    // 转换为字符串并发布到MQTT
    char tempString[8];
    char humiString[8];
    dtostrf(temperature, 1, 2, tempString);  // 转换温度为字符串
    dtostrf(humidity, 1, 2, humiString);     // 转换湿度为字符串
    
    // 发布数据到MQTT服务器
    client.publish(temp_topic, tempString);
    client.publish(humi_topic, humiString);
    
    Serial.println("数据已发送到MQTT服务器");
  }
  
  // 检查WiFi连接状态
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi断开，尝试重连...");
    setup_wifi();
  }
}
```

**Arduino库安装：**
1. 打开Arduino IDE
2. 进入"工具" → "管理库"
3. 搜索并安装以下库：
   - `PubSubClient`（MQTT客户端）
   - `DHT sensor library`（DHT传感器库）
   - `Adafruit Unified Sensor`（DHT依赖库）

**配置说明：**
1. 修改WiFi配置：替换`ssid`和`password`
2. 修改MQTT配置：替换`mqtt_server`为您的Home Assistant IP
3. 修改MQTT凭据：替换`mqtt_user`和`mqtt_pass`
4. 根据实际接线修改`DHTPIN`引脚号

## 7.7 进阶技巧

### 7.7.1 自定义仪表板

Home Assistant支持创建自定义仪表板：

1. 进入"概览"页面
2. 点击右上角三个点 → "编辑仪表板"
3. 点击右下角"+ 添加卡片"
4. 选择卡片类型：
   - **实体卡片**：显示单个实体状态
   - **传感器卡片**：显示传感器历史图表
   - **按钮卡片**：控制设备开关
   - **垂直/水平堆叠**：组合多个卡片

### 7.7.2 创建场景

场景可以一键切换多个设备的状态：

```yaml
# 场景配置示例
scene:
  - name: "Movie Mode"
    entities:
      light.living_room:
        state: "on"
        brightness: 50
        color_name: "blue"
      switch.tv:
        state: "on"
      cover.curtain:
        state: "closed"
  
  - name: "Good Night"
    entities:
      light.all_lights:
        state: "off"
      switch.fan:
        state: "off"
      lock.front_door:
        state: "locked"
```

### 7.7.3 添加通知服务

配置推送通知：

```yaml
# 在configuration.yaml中添加
notify:
  - platform: html5
    name: "Web Push"
    gcm_api_key: "YOUR_GCM_API_KEY"
    gcm_sender_id: "YOUR_GCM_SENDER_ID"
    
  - platform: smtp
    name: "Email"
    sender: "your_email@gmail.com"
    recipient: "recipient@example.com"
    server: "smtp.gmail.com"
    port: 587
    username: "your_email@gmail.com"
    password: "your_app_password"
    encryption: "starttls"
```

## 7.8 故障排除

### 7.8.1 常见问题及解决方案

**问题1：无法访问Home Assistant界面**
- 检查树莓派网络连接
- 确认IP地址正确
- 尝试使用`http://homeassistant.local:8123`
- 检查防火墙设置

**问题2：ESPHome设备无法连接**
- 检查WiFi配置是否正确
- 确认设备已成功烧录固件
- 检查Home Assistant与设备在同一网络
- 查看ESPHome日志获取错误信息

**问题3：MQTT连接失败**
- 确认MQTT Broker已启动
- 检查用户名密码是否正确
- 确认端口1883未被防火墙阻止
- 测试MQTT连接：`mosquitto_pub -h [IP] -u [user] -P [pass] -t "test" -m "hello"`

**问题4：自动化不触发**
- 检查自动化是否已启用
- 确认实体ID正确
- 查看自动化跟踪日志
- 测试触发器和条件是否满足

### 7.8.2 调试技巧

1. **查看日志**：设置 → 系统 → 日志
2. **开发者工具**：测试服务调用、查看状态
3. **模板编辑器**：测试模板代码
4. **MQTT调试工具**：查看MQTT消息

## 7.9 安全建议

### 7.9.1 网络安全

1. **使用HTTPS**：配置SSL证书
2. **设置强密码**：使用复杂密码，定期更换
3. **启用双因素认证**：增强账户安全
4. **限制访问IP**：在路由器设置端口转发规则

### 7.9.2 数据安全

1. **定期备份**：设置 → 系统 → 备份
2. **加密敏感数据**：使用secrets.yaml存储密码
3. **限制权限**：为不同用户设置不同权限

## 7.10 总结

本章我们学习了：

1. **Home Assistant基础**：了解了开源智能家居平台的核心概念和优势
2. **安装配置**：在树莓派5上成功安装了Home Assistant OS
3. **ESPHome入门**：使用YAML配置快速创建智能传感器节点
4. **MQTT集成**：实现了Home Assistant与MQTT的通信
5. **自动化规则**：编写了温度控制风扇的自动化规则
6. **替代方案**：学习了直接使用Arduino代码实现MQTT通信

**下一步学习建议：**
- 探索更多的Home Assistant集成（如Zigbee、蓝牙等）
- 学习Node-RED可视化自动化工具
- 尝试创建更复杂的自动化场景
- 研究Home Assistant的API开发

## 附录：常用资源

### 官方资源
- Home Assistant官网：https://www.home-assistant.io/
- ESPHome官网：https://esphome.io/
- Home Assistant中文社区：https://bbs.hassbian.com/

### 学习资源
- Home Assistant官方文档：https://www.home-assistant.io/docs/
- ESPHome官方文档：https://esphome.io/guides/getting_started_hassio
- GitHub示例配置：https://github.com/home-assistant/configuration

### 工具推荐
- MQTT Explorer：MQTT消息调试工具
- Visual Studio Code：YAML配置文件编辑
- Home Assistant Companion App：手机控制应用

---

**🎯 本章项目总结**

通过本章的4个项目，您已经掌握了：
1. 在树莓派5上安装和配置Home Assistant
2. 使用ESPHome创建温湿度传感器节点
3. 编写自动化规则实现智能控制
4. 使用Arduino代码实现MQTT通信

这些技能为您构建完整的智能家居系统奠定了坚实的基础。在下一章中，我们将学习如何将人工智能集成到智能家居中，实现更智能化的控制。