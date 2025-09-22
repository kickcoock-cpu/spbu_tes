# ESP32 Sales Transaction Device - WiFi Version

## Overview
This document describes how to use the WiFi version of the ESP32-based device for sales transactions in the sales application. This version communicates directly with the backend API via HTTP requests.

## Hardware Components
- ESP32 Development Board
- Push Button (connected to GPIO 4)
- LED (connected to GPIO 2)
- Jumper wires
- Breadboard (optional)

## Circuit Diagram
```
ESP32:
- Button: GPIO 4 (with pull-up resistor)
- LED: GPIO 2 (with current limiting resistor)
- Power: 3.3V or 5V
- Ground: GND
```

## Software Setup

### 1. Installing ESP32 Board in Arduino IDE
1. Open Arduino IDE
2. Go to File > Preferences
3. Add the following URL to "Additional Board Manager URLs":
   `https://dl.espressif.com/dl/package_esp32_index.json`
4. Go to Tools > Board > Boards Manager
5. Search for "ESP32" and install "ESP32 by Espressif Systems"

### 2. Required Libraries
1. ArduinoJson (by Benoit Blanchon) - Install from Library Manager
2. WiFi (built-in library)
3. HTTPClient (built-in library)

### 3. Configuration
Before uploading the code, you need to configure:
1. WiFi credentials (SSID and password)
2. Server URL (your backend API endpoint)
3. JWT token for authentication

In the code, update these values:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://your-server-ip:3000/api/sales";
const char* jwtToken = "YOUR_JWT_TOKEN";
```

### 4. Uploading the Code
1. Open the `esp32_sales_transaction_wifi.ino` file
2. Select your ESP32 board from Tools > Board
3. Select the appropriate COM port
4. Click Upload

## Device Operation

### WiFi Communication
- Connects directly to the backend API
- Sends HTTP POST requests to `/api/sales` endpoint
- Requires valid JWT token for authentication

### Button Operation
- Press the button to create a sale transaction with current settings

## Data Format
The device sends transaction data in JSON format directly to the API:
```json
{
  "fuel_type": "Pertamax",
  "liters": 10.0,
  "amount": 15000.0
}
```

## Security Considerations
1. JWT token is stored in plain text in the code - this is not secure for production
2. In a production environment, you should implement:
   - Secure token storage
   - Token refresh mechanism
   - HTTPS communication
   - Device authentication

## Troubleshooting
1. If the device cannot connect to WiFi:
   - Check SSID and password
   - Verify WiFi network availability
   - Check signal strength

2. If API requests fail:
   - Verify server URL
   - Check JWT token validity
   - Ensure backend API is accessible
   - Check firewall settings

3. If the button doesn't work:
   - Check wiring connections
   - Verify pull-up resistor configuration
   - Check for loose connections