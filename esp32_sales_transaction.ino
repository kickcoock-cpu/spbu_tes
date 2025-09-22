// ESP32 Sales Transaction Device
// This code enables ESP32 to communicate with the sales application via Bluetooth

#include "BluetoothSerial.h"
#include <ArduinoJson.h>

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;

// Pin definitions
const int buttonPin = 4;
const int ledPin = 2;

// Variables to hold transaction data
String fuelType = "Pertamax";  // Default fuel type
float liters = 0.0;
float pricePerLiter = 1500.0;  // Default price
float amount = 0.0;

// Button state variables
int lastButtonState = HIGH;
int currentButtonState = HIGH;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

// Transaction counter
int transactionCounter = 0;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32_SalesDevice"); //Bluetooth device name
  Serial.println("Bluetooth Started! Ready to pair...");
  
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Initialize with some default values for testing
  liters = 10.0;
  amount = liters * pricePerLiter;
}

void loop() {
  // Check for data from Bluetooth
  if (SerialBT.available()) {
    String command = SerialBT.readString();
    command.trim();
    
    Serial.println("Received command: " + command);
    
    if (command == "GET_STATUS") {
      sendStatus();
    } else if (command.startsWith("SET_FUEL_TYPE:")) {
      fuelType = command.substring(14);
      sendResponse("FUEL_TYPE_SET", fuelType);
    } else if (command.startsWith("SET_LITERS:")) {
      liters = command.substring(11).toFloat();
      // Recalculate amount
      amount = liters * pricePerLiter;
      sendResponse("LITERS_SET", String(liters, 2));
    } else if (command.startsWith("SET_PRICE:")) {
      pricePerLiter = command.substring(10).toFloat();
      // Recalculate amount
      amount = liters * pricePerLiter;
      sendResponse("PRICE_SET", String(pricePerLiter, 2));
    } else if (command == "CREATE_SALE") {
      createSale();
    } else {
      Serial.println("Unknown command: " + command);
    }
  }
  
  // Check button press for manual transaction creation
  checkButtonPress();
  
  delay(20);
}

void checkButtonPress() {
  int reading = digitalRead(buttonPin);
  
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != currentButtonState) {
      currentButtonState = reading;
      
      if (currentButtonState == LOW) {
        // Button pressed - create a sale
        Serial.println("Button pressed, creating sale...");
        digitalWrite(ledPin, HIGH);
        createSale();
        delay(1000); // Debounce delay
        digitalWrite(ledPin, LOW);
      }
    }
  }
  
  lastButtonState = reading;
}

void createSale() {
  // Increment transaction counter
  transactionCounter++;
  
  // Calculate amount based on liters and price
  amount = liters * pricePerLiter;
  
  // Create JSON object for sale data
  StaticJsonDocument<200> doc;
  doc["fuel_type"] = fuelType;
  doc["liters"] = liters;
  doc["amount"] = amount;
  doc["transaction_id"] = transactionCounter;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  // Send sale data via Bluetooth
  SerialBT.println("SALE_DATA:" + jsonData);
  Serial.println("Sale data sent: " + jsonData);
  
  // Flash LED to indicate transaction
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
}

void sendStatus() {
  StaticJsonDocument<200> doc;
  doc["status"] = "READY";
  doc["fuel_type"] = fuelType;
  doc["liters"] = liters;
  doc["amount"] = amount;
  doc["price_per_liter"] = pricePerLiter;
  doc["device_name"] = "ESP32_SalesDevice";
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  SerialBT.println("STATUS:" + jsonData);
  Serial.println("Status sent: " + jsonData);
}

void sendResponse(String responseType, String value) {
  SerialBT.println(responseType + ":" + value);
  Serial.println("Response sent: " + responseType + ":" + value);
}