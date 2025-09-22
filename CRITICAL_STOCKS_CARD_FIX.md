# Critical Stocks Card Fix

## Issue
The Critical Stocks Card in the dashboard was not displaying any data, showing "0" even when there were tanks with low fuel levels.

## Root Causes Identified
1. **Data Type Issues**: The `daysUntilStockout` value was sometimes not properly converted to a number in the backend API response.
2. **Insufficient Validation**: The frontend filtering logic didn't have enough validation to handle edge cases with data types.
3. **Missing Data Checks**: The frontend didn't properly check if the stock predictions data was available before trying to filter it.

## Fixes Implemented

### Backend (dashboardController.js)
1. **Explicit Number Conversion**: Ensured that `daysUntilStockout` is always returned as a number:
   ```javascript
   daysUntilStockout: Number(daysUntilStockout)
   ```

2. **Added validation in both Super Admin and Admin/Operator sections** to ensure consistent data types.

### Frontend (dashboard-overview.tsx)
1. **Enhanced Data Validation**: Added more robust checks for the stock predictions data:
   ```javascript
   if (!dashboardData?.stockPredictions || !Array.isArray(dashboardData.stockPredictions)) {
     return [];
   }
   ```

2. **Improved Filtering Logic**: Added additional validation to ensure the days value is a valid finite number:
   ```javascript
   const isCritical = !isNaN(days) && isFinite(days) && days <= 5;
   ```

3. **Added Comprehensive Logging**: Added detailed console logs to help identify issues:
   ```javascript
   console.log(`Is critical: ${isCritical}, days: ${days}, isNaN: ${isNaN(days)}, isFinite: ${isFinite(days)}`);
   ```

### Frontend (summary-stats.tsx)
1. **Added Debugging Information**: Added logging to verify the data being passed to the component:
   ```javascript
   console.log('Critical stocks type:', typeof criticalStocks, 'Value:', criticalStocks);
   ```

## Verification
The fixes ensure that:
1. The backend always returns `daysUntilStockout` as a proper number
2. The frontend properly validates data before filtering
3. Edge cases with data types are handled gracefully
4. The Critical Stocks Card now correctly displays the count of tanks with critical stock levels (≤5 days until stockout)

## Files Modified
- `backend/controllers/dashboardController.js`
- `frontend/src/features/dashboard/components/dashboard-overview.tsx`
- `frontend/src/features/dashboard/components/summary-stats.tsx`