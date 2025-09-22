# Mobile Operator Sales Form - Tank Stock Integration

## Overview
Enhanced the mobile operator sales form to display real-time tank stock information with relationships directly within the form. This provides operators with immediate visibility into fuel availability while creating sales transactions.

## Key Enhancements

### 1. Fuel Type Selection with Stock Information
- **Enhanced Dropdown**: Each fuel type in the selection dropdown now shows:
  - Current price per liter
  - Total stock and capacity
  - Fill percentage and status (Critical, Low, Normal, Good)

### 2. Dedicated Tank Stock Status Card
When a fuel type is selected, a card displays detailed stock information:
- **Current Stock**: Total liters available for the selected fuel type
- **Total Capacity**: Combined capacity of all tanks for that fuel type
- **Fill Level**: Visual indicator with color-coded status
- **Price**: Current price per liter
- **Progress Bar**: Visual representation of stock level

### 3. Stock Validation
- **Real-time Validation**: Prevents creation of sales that exceed available stock
- **Visual Warnings**: Shows warnings when entered liters approach or exceed available stock
- **Error Messages**: Clear error messages when attempting to sell more than available

### 4. Automatic Data Refresh
- **Periodic Updates**: Tank data automatically refreshes every 30 seconds
- **Post-Sale Updates**: Data refreshes after each successful sale
- **Manual Refresh**: Data can be manually refreshed by invalidating queries

## Technical Implementation

### New Functions Added
1. `getFillPercentage()`: Calculates fill percentage for tanks
2. `getStatusText()`: Determines status based on fill level
3. `getStatusColor()`: Returns color classes based on status
4. `getFuelColor()`: Returns color classes based on fuel type
5. `getTanksByFuelType()`: Filters tanks by fuel type
6. `getTotalStockByFuelType()`: Calculates total stock for a fuel type
7. `getTotalCapacityByFuelType()`: Calculates total capacity for a fuel type

### UI Components Added
1. **Stock Status Card**: Displays detailed tank information
2. **Progress Bar**: Visual representation of stock levels
3. **Color-coded Status Indicators**: Visual cues for stock status
4. **Validation Warnings**: Real-time feedback on stock availability

### Data Flow
1. Fetches tank and price data on component mount
2. Calculates aggregated stock information by fuel type
3. Displays real-time stock status in the form
4. Validates sales against available stock
5. Automatically refreshes data every 30 seconds

## User Experience Improvements

### Visual Enhancements
- Color-coded status indicators (Red=Critical, Yellow=Low, Blue=Normal, Green=Good)
- Progress bars showing fill levels
- Clear typography hierarchy for important information
- Consistent with existing mobile UI design

### Functional Improvements
- Prevents overselling by validating against available stock
- Provides immediate feedback on stock availability
- Shows detailed tank information without leaving the form
- Automatic data refresh ensures current information

## Error Handling
- Loading states with spinner animations
- Error states with clear error messages
- Graceful handling of missing or invalid data
- Validation errors for stock exceedance

## Integration Points
- Uses existing API endpoints (`/api/tanks`, `/api/prices`)
- Integrates with React Query for data fetching and caching
- Leverages existing UI components and styling
- Maintains compatibility with existing form functionality