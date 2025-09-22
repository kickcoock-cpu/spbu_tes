# Critical Stocks Card Fix - Based on Tank Status

## Issue
The Critical Stocks Card was calculating critical stocks based on days until stockout (≤5 days), but the requirement is to count tanks with "Critical" status based on fill percentage.

## Solution Implemented

### 1. Updated Critical Stocks Calculation
Changed the critical stocks calculation from:
- **Old approach**: Counting stocks with ≤5 days until stockout
- **New approach**: Counting tanks with Critical status (percentage < 20%)

### 2. Modified Dashboard Overview Component
Updated `dashboard-overview.tsx` to:

1. **Calculate critical stocks based on tank status**:
   ```javascript
   // Filter tanks with Critical status (percentage < 20)
   const criticalTanks = tankStocks.filter(tank => {
     // Check if tank is Critical (percentage < 20)
     const isCritical = tank.percentage < 20;
     return isCritical;
   });
   ```

2. **Updated Critical Stock Alerts section**:
   - Removed dependency on `CriticalStockAlert` component
   - Created inline critical tank alerts using tank data
   - Display tank name, current stock, capacity, and percentage
   - Maintained "Order Now" button functionality

3. **Updated imports**:
   - Removed `CriticalStockAlert` import
   - Added `Droplets` icon import
   - Added `useNavigate` hook

### 3. Status Determination Logic
Based on the `TankStatusCard` component, tank status is determined by:
- **Critical**: percentage < 20
- **Low**: percentage < 50
- **Normal**: percentage < 80
- **Good**: percentage >= 80

## Files Modified
1. `frontend/src/features/dashboard/components/dashboard-overview.tsx`
   - Updated critical stocks calculation
   - Modified Critical Stock Alerts section
   - Updated imports
   - Added navigation hook

## Verification
The fix ensures that:
1. Critical Stocks count in the dashboard summary reflects tanks with <20% fill level
2. Critical Stock Alerts section displays tanks with Critical status
3. Users can see which specific tanks are critical and need immediate attention
4. "Order Now" button is available for critical tanks to initiate deliveries

## Testing
To verify the fix:
1. Check that tanks with <20% fill level are counted as critical
2. Verify that the Critical Stocks Card shows the correct count
3. Confirm that Critical Stock Alerts display the appropriate tanks
4. Test that the "Order Now" button navigates to the deliveries page