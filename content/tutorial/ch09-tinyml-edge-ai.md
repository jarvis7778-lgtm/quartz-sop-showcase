# 第9章：TinyML 边缘AI

## 学习目标

学完本章，你将能够：
- 理解TinyML的概念和意义
- 掌握TensorFlow Lite Micro的部署流程
- 使用Edge Impulse平台训练和部署模型
- 在ESP32-S3上实现手势识别、图像分类、语音识别
- 了解模型优化技术（量化、剪枝）

---

## 9.1 什么是TinyML？

### 定义
TinyML（Tiny Machine Learning）是在微控制器上运行的机器学习。与云端AI相比：

| 特性 | 云端AI | TinyML |
|------|--------|--------|
| 延迟 | 100ms-数秒 | <10ms |
| 隐私 | 数据上传云端 | 数据不出设备 |
| 离线能力 | 需要网络 | 完全离线 |
| 功耗 | 需要服务器 | mW级别 |
| 成本 | API调用费 | 一次性硬件成本 |

### 为什么ESP32-S3适合TinyML？

ESP32-S3是Espressif专为AI设计的MCU：
- **双核240MHz** Xtensa LX7处理器
- **AI向量指令（SIMD）**：一条指令处理多个数据
- **512KB SRAM + 8MB PSRAM**：足够运行小型神经网络
- **内置摄像头接口**：支持OV2640/OV5640
- **I2S接口**：支持数字麦克风

---

## 9.2 TensorFlow Lite Micro 工作流程

### 完整流程

```
1. 数据采集 → 2. 模型训练 → 3. 模型量化 → 4. 转换为TFLite → 5. 部署到ESP32
   (Arduino/PC)    (Python)      (INT8)       (.tflite)        (C++嵌入)
```

### 模型训练（Python端）

```python
import tensorflow as tf

# 1. 构建简单模型
model = tf.keras.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(3,)),  # 3轴加速度
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(3, activation='softmax')  # 3种手势
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# 2. 训练（用你自己的数据）
model.fit(X_train, y_train, epochs=50, validation_data=(X_val, y_val))

# 3. 转换为TFLite格式
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# 4. INT8量化（关键！减小模型体积）
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.int8]

tflite_model = converter.convert()

# 5. 保存
with open('gesture_model.tflite', 'wb') as f:
    f.write(tflite_model)

# 6. 转换为C数组（用于嵌入设备）
# 使用 xxd 或在线工具将 .tflite 转为 .h 文件
```

### 转换为C头文件

```bash
# 在终端执行
xxd -i gesture_model.tflite > model_data.h
```

生成的 `model_data.h` 内容类似：
```cpp
unsigned char gesture_model_tflite[] = {
  0x1c, 0x00, 0x00, 0x00, 0x54, 0x46, 0x4c, 0x33, ...
};
unsigned int gesture_model_tflite_len = 1234;
```

---

## 9.3 Edge Impulse：无代码TinyML平台

Edge Impulse是一个在线平台，让你不用写Python代码就能训练和部署TinyML模型。

### 使用流程

1. **注册账号**：https://www.edgeimpulse.com
2. **创建项目**：选择"Accelerometer data"或"Image data"
3. **采集数据**：通过手机或ESP32直接采集
4. **设计模型**：使用可视化编辑器
5. **训练模型**：一键训练
6. **部署**：导出Arduino库或TFLite模型

### Edge Impulse导出Arduino库

Edge Impulse可以直接导出为Arduino库，使用方法：

```cpp
#include <your_project_inference.h>

// 初始化
ei_impulse_result_t result;

// 准备数据（如加速度计数据）
float features[] = {ax, ay, az};

// 运行推理
EI_IMPULSE_ERROR res = run_classifier(features, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, false);

if (res == EI_IMPULSE_OK) {
    // 读取结果
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
        Serial.print(result.classification[ix].label);
        Serial.print(": ");
        Serial.println(result.classification[ix].value);
    }
}
```

---

## 9.4 ESP-NN加速

ESP-NN是Espressif提供的神经网络加速库，利用ESP32-S3的SIMD指令加速推理。

### 启用ESP-NN

在PlatformIO的`platformio.ini`中：
```ini
[env:esp32-s3]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
build_flags = -DCONFIG_NN_OPTIMIZED=1
```

在Arduino IDE中，安装`esp-tflite-micro`库（不是标准的TFLite Micro）。

### 性能对比

| 操作 | 标准TFLM | ESP-NN加速 |
|------|---------|-----------|
| Conv2D (3x3) | 15ms | 5ms |
| DepthwiseConv | 12ms | 4ms |
| Fully Connected | 3ms | 1ms |

---

## 项目9.1：ESP32-S3 手势识别

### 目标
用MPU6050加速度计识别3种手势（上下摇、左右摇、静止）。

### BOM表

| 物品 | 数量 | 价格 |
|------|------|------|
| ESP32-S3-DevKitC-1 | 1 | ¥35 |
| MPU6050模块 | 1 | ¥8 |
| 面包板+杜邦线 | 1套 | ¥10 |
| **合计** | | **~¥53** |

### 接线
```
ESP32-S3       MPU6050
────────       ────────
GPIO8 (SDA) ─── SDA
GPIO9 (SCL) ─── SCL
3.3V        ─── VCC
GND         ─── GND
```

### 步骤

1. **数据采集阶段**（Arduino代码）

```cpp
#include <Wire.h>
#include <MPU6050.h>

// 需要安装库：Arduino IDE → 库管理器 → 搜索 "MPU6050" (ElectronicCats)
// 或：https://github.com/ElectronicCats/mpu6050

MPU6050 mpu;

void setup() {
    Serial.begin(115200);
    Wire.begin(8, 9);  // SDA=8, SCL=9
    mpu.initialize();
    
    Serial.println("开始采集数据...");
    Serial.println("请执行手势，数据将通过串口输出");
}

void loop() {
    int16_t ax, ay, az;
    mpu.getAcceleration(&ax, &ay, &az);
    
    // 转换为g单位
    float ax_g = ax / 16384.0;
    float ay_g = ay / 16384.0;
    float az_g = az / 16384.0;
    
    // 输出CSV格式（方便导入Edge Impulse）
    Serial.print(ax_g, 3); Serial.print(",");
    Serial.print(ay_g, 3); Serial.print(",");
    Serial.println(az_g, 3);
    
    delay(50);  // 20Hz采样率
}
```

2. **在Edge Impulse上训练模型**
   - 上传采集的数据
   - 标签：`up_down`、`left_right`、`still`
   - 创建Impulse（输入：3轴加速度，输出：3类）
   - 训练并导出Arduino库

3. **部署推理代码**

```cpp
#include <Wire.h>
#include <MPU6050.h>

// 需要安装库：Arduino IDE → 库管理器 → 搜索 "MPU6050" (ElectronicCats)
// 或：https://github.com/ElectronicCats/mpu6050
#include <your_project_inference.h>  // Edge Impulse导出的库

MPU6050 mpu;
float features[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];

void setup() {
    Serial.begin(115200);
    Wire.begin(8, 9);
    mpu.initialize();
    Serial.println("手势识别系统已启动");
}

void loop() {
    // 采集一帧数据
    for (int i = 0; i < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE / 3; i++) {
        int16_t ax, ay, az;
        mpu.getAcceleration(&ax, &ay, &az);
        
        features[i * 3] = ax / 16384.0;
        features[i * 3 + 1] = ay / 16384.0;
        features[i * 3 + 2] = az / 16384.0;
        
        delay(50);
    }
    
    // 运行推理
    signal_t signal;
    numpy::signal_from_buffer(features, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    
    ei_impulse_result_t result;
    EI_IMPULSE_ERROR res = run_classifier(&signal, &result, false);
    
    if (res == EI_IMPULSE_OK) {
        Serial.println("====== 推理结果 ======");
        for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
            Serial.print(result.classification[ix].label);
            Serial.print(": ");
            Serial.print(result.classification[ix].value * 100, 1);
            Serial.println("%");
        }
        
        // 找到最高概率的类别
        float maxVal = 0;
        int maxIdx = 0;
        for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
            if (result.classification[ix].value > maxVal) {
                maxVal = result.classification[ix].value;
                maxIdx = ix;
            }
        }
        
        Serial.print("识别结果: ");
        Serial.println(result.classification[maxIdx].label);
    }
    
    delay(1000);  // 每秒识别一次
}
```

---

## 项目9.2：ESP32-S3 图像分类

### 目标
用OV2640摄像头识别简单物体（猫/狗/人）。

### 硬件
- ESP32-S3开发板 + OV2640摄像头模块

### 简化方案：使用ESP-DL

ESP-DL是乐鑫官方的深度学习框架，预置了常用模型。

```cpp
#include "esp_camera.h"
#include "dl_image.hpp"
#include "human_face_detect.hpp"

// 配置摄像头引脚（ESP32-S3-EYE）
#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  15
#define SIOD_GPIO_NUM  4
#define SIOC_GPIO_NUM  5
#define Y2_GPIO_NUM    11
#define Y3_GPIO_NUM    9
#define Y4_GPIO_NUM    8
#define Y5_GPIO_NUM    10
#define Y6_GPIO_NUM    12
#define Y7_GPIO_NUM    18
#define Y8_GPIO_NUM    17
#define Y9_GPIO_NUM    16
#define VSYNC_GPIO_NUM 6
#define HREF_GPIO_NUM  7
#define PCLK_GPIO_NUM  13

void setup() {
    Serial.begin(115200);
    
    camera_config_t config;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_RGB565;
    config.frame_size = FRAMESIZE_QVGA;
    
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("摄像头初始化失败: 0x%x\n", err);
        return;
    }
    
    Serial.println("摄像头就绪，开始检测...");
}

void loop() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("获取图像失败");
        return;
    }
    
    // 这里可以接入TFLite模型进行分类
    // 简化示例：输出图像尺寸
    Serial.printf("图像尺寸: %dx%d, %d bytes\n", fb->width, fb->height, fb->len);
    
    esp_camera_fb_return(fb);
    delay(2000);
}
```

---

## 项目9.3：ESP32-S3 语音关键词识别

### 目标
识别"开灯"和"关灯"两个关键词。

### 硬件
- ESP32-S3 + INMP441数字麦克风

### 接线
```
ESP32-S3       INMP441
────────       ────────
GPIO4  ──────── WS (LRCLK)
GPIO5  ──────── SCK (BCLK)
GPIO6  ──────── SD (DOUT)
3.3V   ──────── VDD
GND    ──────── GND
```

### 使用Micro Speech示例

ESP32-S3的TFLite Micro库包含Micro Speech示例，可直接识别"yes"、"no"、"unknown"、"silence"。

```cpp
#include <TFLiteMicro.h>
#include "micro_speech_model_data.h"
#include "audio_provider.h"
#include "recognize_commands.h"

// 初始化
void setup() {
    Serial.begin(115200);
    Serial.println("语音关键词识别系统启动");
    
    // 初始化音频采集
    InitAudioProvider();
}

void loop() {
    // 获取音频数据
    int16_t* audio_samples = GetAudioSamples();
    
    // 运行推理
    TfLiteTensor* input = interpreter->input(0);
    memcpy(input->data.int8, audio_samples, input->bytes);
    
    interpreter->Invoke();
    
    // 读取结果
    TfLiteTensor* output = interpreter->output(0);
    
    int8_t yes_score = output->data.int8[0];      // "yes"得分
    int8_t no_score = output->data.int8[1];       // "no"得分
    int8_t unknown_score = output->data.int8[2];  // "unknown"得分
    int8_t silence_score = output->data.int8[3];  // "silence"得分
    
    // 找到最高得分
    int max_idx = 0;
    int8_t max_score = yes_score;
    
    if (no_score > max_score) { max_idx = 1; max_score = no_score; }
    if (unknown_score > max_score) { max_idx = 2; max_score = unknown_score; }
    if (silence_score > max_score) { max_idx = 3; max_score = silence_score; }
    
    const char* labels[] = {"是(yes)", "否(no)", "未知", "安静"};
    
    if (max_score > 128) {  // 阈值
        Serial.print("识别结果: ");
        Serial.println(labels[max_idx]);
        
        // 根据识别结果控制设备
        if (max_idx == 0) {  // "yes" → 开灯
            digitalWrite(LED_PIN, HIGH);
            Serial.println("执行: 开灯");
        } else if (max_idx == 1) {  // "no" → 关灯
            digitalWrite(LED_PIN, LOW);
            Serial.println("执行: 关灯");
        }
    }
    
    delay(100);
}
```

---

## 项目9.4（可选）：Jetson Nano 目标检测

> **注意**：Jetson Nano已多次停产，价格波动大（约¥800-1500）。如预算有限，可跳过本项目。

### 使用YOLOv8 + TensorRT

在Jetson Nano上使用ultralytics库和TensorRT加速：

```bash
# 安装ultralytics
pip install ultralytics

# 转换模型为TensorRT格式
from ultralytics import YOLO
model = YOLO("yolov8n.pt")
model.export(format="engine", device=0)  # 导出TensorRT引擎

# 运行推理
model = YOLO("yolov8n.engine")
results = model.predict(source=0, show=True)  # 摄像头实时检测
```

### 替代方案

如Jetson Nano不可用，可用：
- **树莓派5 + Coral USB加速器**：约¥700-900
- **ESP32-S3 + ESP-DL**：适合简单分类任务
- **云端推理**：将图像发送到云端API处理

---

## 扩展思考

1. **模型优化技巧**
   - INT8量化可将模型缩小4倍，精度损失<2%
   - 剪枝可移除不重要的权重
   - 知识蒸馏用大模型教小模型

2. **内存管理**
   - ESP32-S3的512KB SRAM要合理分配
   - 使用PSRAM存放模型权重
   - Tensor Arena大小需要实验确定

3. **进阶方向**
   - 传感器融合：IMU + 麦克风 + 摄像头
   - 多任务学习：一个模型做多件事
   - 联邦学习：设备端训练，云端聚合
