# Critical Stock Count Fix

## Issue
The dashboard was showing "Critical Stocks: 0" even when there were tanks with low fuel levels. This was happening because of several issues in the data handling logic.

## Root Causes Identified
1. **Data Type Issues**: The `daysUntilStockout` value was sometimes being returned as a string instead of a number, causing the comparison `daysUntilStockout <= 5` to fail.
2. **Invalid Data Handling**: In some cases, tank data might have invalid values (NaN or null) for current stock or tank capacity, which would cause calculation errors.
3. **Date Comparison Logic**: There were issues with the date range comparisons for calculating consumption trends.

## Fixes Implemented

### Backend (dashboardController.js)
1. **Data Type Validation**: Added explicit type checking and conversion to ensure `daysUntilStockout` is always a number:
   ```javascript
   daysUntilStockout = Number(daysUntilStockout);
   ```

2. **Invalid Data Handling**: Added validation to check for invalid stock data:
   ```javascript
   if (isNaN(currentStock) || isNaN(tankCapacity) || tankCapacity <= 0) {
     daysUntilStockout = 999; // Default to normal
   }
   ```

3. **Fixed Date Comparison Logic**: Corrected the date range calculations for comparing sales data trends.

4. **Enhanced Logging**: Added detailed logging to help identify issues:
   ```javascript
   console.log(`[Super Admin] Tank ${tank.id} - Final Days Until Stockout: ${daysUntilStockout} (type: ${typeof daysUntilStockout})`);
   ```

### Frontend (dashboard-overview.tsx)
1. **Robust Filtering**: Updated the critical stock filtering logic to handle data type issues:
   ```javascript
   const days = Number(stock.daysUntilStockout);
   const isCritical = !isNaN(days) && days <= 5;
   ```

2. **Enhanced Debugging**: Added console logging to track the filtering process and identify issues.

3. **Data Validation in Chart Component**: Ensured the StockPredictionChart also properly validates data types:
   ```javascript
   const days = Number(stock.daysUntilStockout);
   const isCritical = !isNaN(days) && days <= 5;
   ```

## Verification
The fixes ensure that:
1. Tanks with genuinely low fuel levels (< 20% capacity) are properly identified as critical (5 days or less until stockout)
2. Data type mismatches no longer cause the filtering to fail
3. Invalid data is handled gracefully without breaking the application
4. The dashboard now accurately displays the critical stocks count

## Files Modified
- `backend/controllers/dashboardController.js`
- `frontend/src/features/dashboard/components/dashboard-overview.tsx`
- `frontend/src/features/dashboard/components/summary-stats.tsx`
- `frontend/src/features/dashboard/components/stock-prediction-chart.tsx`