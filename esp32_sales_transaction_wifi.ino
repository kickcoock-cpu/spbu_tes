// ESP32 Sales Transaction Device - WiFi Version
// This code enables ESP32 to communicate with the sales application via WiFi

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server details
const char* serverURL = "http://your-server-ip:3000/api/sales";  // Replace with your actual server URL
const char* jwtToken = "YOUR_JWT_TOKEN";  // This would normally be obtained through authentication

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
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Initialize with some default values for testing
  liters = 10.0;
  amount = liters * pricePerLiter;
}

void loop() {
  // Check button press for manual transaction creation
  checkButtonPress();
  
  // Keep WiFi connected
  if (WiFi.status() != WL_CONNECTED) {
    reconnectWiFi();
  }
  
  delay(1000);
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
  
  // Send sale data via WiFi
  sendSaleData();
  
  // Flash LED to indicate transaction
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
}

void sendSaleData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Specify URL
    http.begin(serverURL);
    
    // Specify content-type header
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(jwtToken));
    
    // Create JSON object for sale data
    StaticJsonDocument<200> doc;
    doc["fuel_type"] = fuelType;
    doc["liters"] = liters;
    doc["amount"] = amount;
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    // Send HTTP POST request
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on HTTP request");
      Serial.println("HTTP Response code: " + String(httpResponseCode));
    }
    
    // Free resources
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

void reconnectWiFi() {
  Serial.println("Reconnecting to WiFi...");
  WiFi.disconnect();
  WiFi.reconnect();
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi reconnected");
}