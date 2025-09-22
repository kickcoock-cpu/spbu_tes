// ESP32 Sales Transaction Device
// Enhanced version with price synchronization

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
    } else if (command.startsWith("SET_TRANSACTION_DATA:")) {
      // Set all transaction data at once
      String jsonData = command.substring(21); // Remove "SET_TRANSACTION_DATA:" prefix
      parseTransactionData(jsonData);
    } else if (command == "CREATE_SALE") {
      createSale();
    } else {
      Serial.println("Unknown command: " + command);
      sendResponse("ERROR", "Unknown command: " + command);
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
  doc["price_per_liter"] = pricePerLiter;
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
  StaticJsonDocument<300> doc;
  doc["status"] = "READY";
  doc["fuel_type"] = fuelType;
  doc["liters"] = liters;
  doc["amount"] = amount;
  doc["price_per_liter"] = pricePerLiter;
  doc["device_name"] = "ESP32_SalesDevice";
  doc["transaction_counter"] = transactionCounter;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  SerialBT.println("STATUS:" + jsonData);
  Serial.println("Status sent: " + jsonData);
}

void sendResponse(String responseType, String value) {
  SerialBT.println(responseType + ":" + value);
  Serial.println("Response sent: " + responseType + ":" + value);
}

void parseTransactionData(String jsonData) {
  Serial.println("Parsing transaction data: " + jsonData);
  
  // Parse JSON data
  StaticJsonDocument<300> doc;
  DeserializationError error = deserializeJson(doc, jsonData);
  
  if (error) {
    Serial.println("Failed to parse JSON: " + String(error.c_str()));
    sendResponse("ERROR", "Failed to parse JSON: " + String(error.c_str()));
    return;
  }
  
  // Update values if they exist in the JSON
  if (doc.containsKey("fuel_type")) {
    fuelType = doc["fuel_type"].as<String>();
  }
  
  if (doc.containsKey("liters")) {
    liters = doc["liters"];
  }
  
  if (doc.containsKey("price_per_liter")) {
    pricePerLiter = doc["price_per_liter"];
  }
  
  // Recalculate amount
  amount = liters * pricePerLiter;
  
  // Send confirmation
  sendResponse("TRANSACTION_DATA_SET", "OK");
  
  Serial.println("Transaction data updated:");
  Serial.println("  Fuel type: " + fuelType);
  Serial.println("  Liters: " + String(liters, 2));
  Serial.println("  Price per liter: " + String(pricePerLiter, 2));
  Serial.println("  Amount: " + String(amount, 2));
}