# How to Test Bluetooth Functionality in Mobile Operator Sales View

## Prerequisites

1. **Browser Support**: You need a browser that supports Web Bluetooth API
   - Chrome (Desktop and Android)
   - Edge (Desktop)
   - Other browsers with Web Bluetooth support

2. **Device**: You need an ESP32 device flashed with the sales transaction firmware
   - The device should advertise as "ESP32_SalesDevice"
   - The device should be powered on and within range

3. **User Role**: You need to be logged in as an Operator
   - Only operators have access to the sales transaction feature

4. **Mobile View**: You need to be viewing the application in mobile mode
   - Either use a mobile device or resize your browser window to mobile size
   - The application should detect mobile view automatically

## Testing Steps

### 1. Access the Mobile Operator Sales View
- Log in to the application as an Operator
- Navigate to the Sales Management section
- Ensure you're in mobile view (either on a mobile device or resized browser)

### 2. Verify Bluetooth Section Visibility
- Look for the "ESP32 Device Connection" section at the top of the sales form
- If you don't see this section, check:
  - Are you logged in as an Operator?
  - Are you in mobile view?
  - Does your browser support Web Bluetooth?

### 3. Scan for Devices
- Click the "Scan for Devices" button
- Look for "ESP32_SalesDevice" in the device list
- If no devices appear:
  - Ensure your ESP32 device is powered on
  - Ensure your ESP32 device is advertising as "ESP32_SalesDevice"
  - Ensure your device is within Bluetooth range

### 4. Connect to Device
- Click "Connect" next to your ESP32 device
- Wait for connection confirmation
- You should see a green "Connected" status indicator

### 5. Test Device Functionality
- Click "Send Test Data" to verify communication with the device
- Click "Refresh Status" to check device status
- Toggle the "Auto-submit transactions from device" switch

### 6. Process a Transaction
- Select a fuel type from the dropdown
- Enter liters in the input field
- Data should automatically sync to the ESP32 device
- Process the sale on the physical device
- If auto-submit is enabled, the transaction should automatically appear in the system
- If auto-submit is disabled, click "Create Sale" to finalize the transaction

## Troubleshooting

### Common Issues

1. **"Bluetooth is not supported in your browser"**
   - Solution: Use Chrome or Edge browser

2. **No devices found during scan**
   - Solution: 
     - Ensure ESP32 is powered on
     - Ensure ESP32 is advertising as "ESP32_SalesDevice"
     - Ensure device is within Bluetooth range

3. **Connection fails**
   - Solution:
     - Check browser console for error messages
     - Ensure ESP32 firmware is correctly flashed
     - Try reconnecting

4. **Auto-submit not working**
   - Solution:
     - Ensure toggle switch is enabled
     - Verify device is sending SALE_DATA messages
     - Check browser console for errors

### Browser Console
- Open browser developer tools (F12)
- Check the Console tab for any error messages
- Look for Bluetooth-related messages
- Common error messages:
  - "Bluetooth is not supported" - Browser doesn't support Web Bluetooth
  - "User cancelled the request" - User cancelled device selection
  - "Connection failed" - Could not connect to device

## Supported Browsers

### Desktop
- Chrome 56+
- Edge 79+

### Mobile
- Chrome for Android 56+
- Samsung Internet 6.2+
- Other Android browsers with Web Bluetooth support

### Not Supported
- Safari (iOS and macOS)
- Firefox
- Internet Explorer
- Older browser versions

## Device Requirements

### ESP32 Firmware
- Must advertise as "ESP32_SalesDevice"
- Must support Bluetooth Serial communication
- Must implement the required command interface:
  - GET_STATUS
  - SET_TRANSACTION_DATA
  - SALE_DATA
  - TRANSACTION_SUCCESS
  - TRANSACTION_ERROR

### Physical Setup
- ESP32 development board
- Power source
- Bluetooth antenna (built-in or external)
- Proper grounding

## User Permissions

Only users with the "Operator" role can access the Bluetooth sales functionality:
- Operators can create sales transactions
- Operators can connect to Bluetooth devices
- Operators can process transactions from devices
- Other roles (Admin, Super Admin) have different views

## Mobile View Detection

The application automatically switches to mobile view based on screen size:
- Width less than 768px triggers mobile view
- Mobile view shows simplified interface
- Desktop view shows full-featured interface
- View switching is seamless and automatic

If you're having issues seeing the Bluetooth functionality:
1. Check your browser width (resize to less than 768px for mobile view)
2. Verify you're logged in as an Operator
3. Ensure your browser supports Web Bluetooth
4. Check browser console for error messages