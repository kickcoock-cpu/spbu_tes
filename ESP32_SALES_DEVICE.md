# ESP32 Sales Transaction Device

## Overview
This document describes how to use the ESP32-based device for sales transactions in the mobile sales application. The ESP32 device can communicate with the application via Bluetooth to send transaction data.

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
2. BluetoothSerial (built-in library)

### 3. Uploading the Code
1. Open the `esp32_sales_transaction.ino` file
2. Select your ESP32 board from Tools > Board
3. Select the appropriate COM port
4. Click Upload

## Device Operation

### Bluetooth Communication
- Device Name: "ESP32_SalesDevice"
- Baud Rate: 115200
- Communication Protocol: Serial over Bluetooth

### Supported Commands
1. `GET_STATUS` - Returns device status
2. `SET_FUEL_TYPE:<fuel_type>` - Sets the fuel type (e.g., "Pertamax")
3. `SET_LITERS:<liters>` - Sets the liters amount
4. `CREATE_SALE` - Creates a sale transaction

### Button Operation
- Press the button to create a sale transaction with current settings

## Data Format
The device sends transaction data in JSON format:
```json
{
  "fuel_type": "Pertamax",
  "liters": 10.0,
  "amount": 15000.0,
  "transaction_id": 1
}
```

## Troubleshooting
1. If the device doesn't appear in Bluetooth devices, check:
   - Power supply
   - Correct COM port selection
   - Proper installation of ESP32 board package

2. If data is not received by the application:
   - Check Bluetooth pairing
   - Verify baud rate settings
   - Ensure proper JSON formatting

3. If the button doesn't work:
   - Check wiring connections
   - Verify pull-up resistor configuration
   - Check for loose connections