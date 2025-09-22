// ESP32 Sales Transaction Device with Enhanced BLE
// This code enables ESP32 to communicate with the sales application via Bluetooth
// Using UUID: 00001101-0000-1000-8000-00805F9B34FB for Serial Port Service (SPS)

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

// Device status
bool deviceReady = true;
String deviceName = "ESP32_SalesDevice";

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
  
  Serial.println("Device initialized and ready");
}

void loop() {
  // Check for data from Bluetooth
  if (SerialBT.available()) {
    String command = SerialBT.readString();
    command.trim();
    
    Serial.println("Received command: " + command);
    
    if (command == "GET_STATUS") {
      sendStatus();
    } else if (command.startsWith("SET_TRANSACTION_DATA:")) {
      handleTransactionData(command.substring(21)); // Remove "SET_TRANSACTION_DATA:" prefix
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
    } else if (command.startsWith("TEST_DATA:")) {
      handleTestData(command.substring(10)); // Remove "TEST_DATA:" prefix
    } else if (command == "CREATE_SALE") {
      createSale();
    } else {
      Serial.println("Unknown command: " + command);
      SerialBT.println("ERROR:Unknown command: " + command);
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
  StaticJsonDocument<300> doc;
  doc["status"] = deviceReady ? "READY" : "BUSY";
  doc["fuel_type"] = fuelType;
  doc["liters"] = liters;
  doc["amount"] = amount;
  doc["price_per_liter"] = pricePerLiter;
  doc["device_name"] = deviceName;
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

void handleTransactionData(String jsonData) {
  Serial.println("Handling transaction data: " + jsonData);
  
  // Parse JSON data
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, jsonData);
  
  if (error) {
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    SerialBT.println("ERROR:JSON parsing failed: " + String(error.c_str()));
    return;
  }
  
  // Update transaction data
  if (doc.containsKey("fuel_type")) {
    fuelType = doc["fuel_type"].as<String>();
  }
  
  if (doc.containsKey("liters")) {
    liters = doc["liters"];
  }
  
  if (doc.containsKey("price_per_liter")) {
    pricePerLiter = doc["price_per_liter"];
  }
  
  if (doc.containsKey("amount")) {
    amount = doc["amount"];
  }
  
  // Recalculate amount to ensure consistency
  amount = liters * pricePerLiter;
  
  // Send confirmation
  SerialBT.println("TRANSACTION_DATA_SET:OK");
  Serial.println("Transaction data updated successfully");
}

void handleTestData(String jsonData) {
  Serial.println("Handling test data: " + jsonData);
  
  // Parse JSON data
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, jsonData);
  
  if (error) {
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    SerialBT.println("ERROR:JSON parsing failed: " + String(error.c_str()));
    return;
  }
  
  // Update transaction data with test values
  if (doc.containsKey("fuel_type")) {
    fuelType = doc["fuel_type"].as<String>();
  }
  
  if (doc.containsKey("liters")) {
    liters = doc["liters"];
  }
  
  if (doc.containsKey("amount")) {
    amount = doc["amount"];
  }
  
  // Recalculate price to ensure consistency
  if (liters > 0) {
    pricePerLiter = amount / liters;
  }
  
  // Send confirmation
  SerialBT.println("TEST_DATA_SET:OK");
  Serial.println("Test data updated successfully");
}