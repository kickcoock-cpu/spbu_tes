## Common Issues and Solutions

### 1. Bluetooth Not Supported
**Problem**: "Bluetooth is not supported in your browser" message or Bluetooth Device button is disabled
**Solutions**:
- Use a Chromium-based browser (Chrome, Edge, Opera)
- Ensure Bluetooth is enabled on your device
- Check that your browser version supports Web Bluetooth API
- On mobile devices, ensure you're using the device's built-in browser if the app browser doesn't support Bluetooth

### 2. Device Not Found
**Problem**: ESP32 device doesn't appear in the device list
**Solutions**:
- Ensure the ESP32 is powered on and running the correct firmware
- Verify the device name is "ESP32_SalesDevice"
- Restart Bluetooth on both the mobile device and ESP32
- Check that the ESP32 is not already connected to another device

### 3. Connection Fails
**Problem**: Unable to connect to the ESP32 device
**Solutions**:
- Check that the ESP32 firmware is correctly uploaded
- Verify the BluetoothSerial library is properly installed
- Ensure the device is within range (typically 10 meters)
- Try disconnecting and reconnecting

### 4. Data Not Received
**Problem**: ESP32 is connected but no data is received
**Solutions**:
- Check the serial monitor output on the ESP32 to verify it's sending data
- Ensure the data format matches what the application expects:
  ```
  SALE_DATA:{"fuel_type":"Pertamax","liters":10.0,"amount":15000.0,"transaction_id":1}
  ```
- Check browser console for JavaScript errors
- Verify that the characteristic UUID matches (00001101-0000-1000-8000-00805F9B34FB)

### 5. Auto-submit Not Working
**Problem**: Transactions are not automatically submitted even with auto-submit enabled
**Solutions**:
- Ensure the ESP32 is sending data in the correct format
- Check that the "Auto-submit transactions" checkbox is checked
- Verify there are no JavaScript errors in the browser console
- Confirm that the transaction mode is set to "Bluetooth Device"

### 6. Price Synchronization Issues
**Problem**: Prices on ESP32 don't match prices in the application
**Solutions**:
- Check that the ESP32 is properly connected via Bluetooth
- Verify that transaction data is being sent to the device (check browser console)
- Check the ESP32 serial monitor for "Transaction data updated" messages
- Ensure the JSON format is correct when sending transaction data

## Debugging Steps

### 1. Check Browser Console
Open the browser's developer tools and check the console for any error messages related to Bluetooth or data handling. Look for messages like:
- "Checking Bluetooth support..."
- "Bluetooth is supported" or "Bluetooth is not supported"
- "Bluetooth connected to: [device name]"
- "Bluetooth disconnected"
- "Attempting to connect to Bluetooth device..."
- "Device found: [device name]"
- "GATT server connected"
- "Primary service obtained"
- "Characteristic obtained"
- "Event listener added"
- "Notifications started"
- "Received from Bluetooth device: [data]"
- "Sending transaction data to ESP32"
- "Transaction data sent to device"

If you don't see these messages, there may be an issue with the Bluetooth connection or the browser's Web Bluetooth implementation.

### 2. Verify ESP32 Output
Use the Arduino Serial Monitor to check the output from the ESP32:
1. Open Serial Monitor in Arduino IDE
2. Set baud rate to 115200
3. Observe the output when pressing the button or sending commands
4. You should see:
   ```
   Bluetooth Started! Ready to pair...
   ```
5. After connecting, you should see:
   ```
   Sale data sent: SALE_DATA:{"fuel_type":"Pertamax","liters":10.0,"amount":15000.0,"transaction_id":1}
   ```
6. When prices are synchronized, you should see:
   ```
   Transaction data updated:
     Fuel type: Pertamax
     Liters: 10.00
     Price per liter: 15000.00
     Amount: 150000.00
   ```

### 3. Test Data Format
Ensure the ESP32 is sending data in the correct format:
```
SALE_DATA:{"fuel_type":"Pertamax","liters":10.0,"amount":15000.0,"transaction_id":1}
```

### 4. Check Characteristic UUID
Verify that the characteristic UUID used in both the ESP32 firmware and the web application match:
- ESP32: Uses BluetoothSerial library which handles this automatically
- Web App: Uses service and characteristic UUID 0x1101

### 5. Verify State Changes
Check that the Bluetooth state is changing correctly:
- The "Bluetooth Device" button should be enabled when Bluetooth is supported
- After connecting, the button should show as selected when "Bluetooth Device" mode is active

### 6. Check for JavaScript Errors
Look for any JavaScript errors in the console that might prevent the Bluetooth functionality from working correctly.

### 7. Verify Price Synchronization
Check that prices are being synchronized correctly:
1. In the browser console, look for "Sending transaction data to ESP32"
2. In the ESP32 serial monitor, look for "Transaction data updated"
3. Verify that the price per liter matches the price in the application

## Browser Compatibility

The Web Bluetooth API is supported in:
- Chrome (Desktop and Android)
- Edge (Desktop and Android)
- Opera (Desktop and Android)
- Chrome OS
- Android WebView (for mobile apps)

Not supported in:
- Safari (iOS and macOS)
- Firefox
- Internet Explorer

## ESP32 Firmware Verification

To verify the ESP32 firmware is working correctly:

1. Open Serial Monitor in Arduino IDE
2. Set baud rate to 115200
3. You should see:
   ```
   Bluetooth Started! Ready to pair...
   ```
4. When connected, try sending commands:
   - `GET_STATUS` - Should return device status
   - `SET_FUEL_TYPE:Pertalite` - Should set fuel type
   - `SET_LITERS:20.5` - Should set liters amount

5. Press the button connected to GPIO 4 to trigger a sale transaction

## Additional Tips

1. **Pairing**: The first time you connect, you may need to pair the devices. Accept any pairing requests.

2. **Permissions**: Ensure the browser has permission to access Bluetooth.

3. **Background Processes**: Some browsers may disconnect Bluetooth when the tab is not active. Keep the tab active during testing.

4. **Device Conflicts**: If you have multiple ESP32 devices, ensure you're connecting to the correct one.

5. **Range**: Keep the ESP32 within 10 meters of the mobile device for reliable connection.

If you continue to experience issues, please provide:
- Browser and version
- Operating system
- Screenshot of any error messages
- Serial monitor output from the ESP32
- Browser console output