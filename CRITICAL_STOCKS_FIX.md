# Critical Stocks Fix

## Issue
The dashboard was showing "Critical Stocks: 0" even when there were tanks with low fuel levels. This was happening because:

1. The stock prediction algorithm relied solely on actual sales data from the past 30 days
2. In the absence of sales data, it defaulted to 999 days until stockout for all tanks
3. This meant no tanks were considered critical (≤5 days until stockout)

## Solution
Modified the stock prediction calculation logic in the backend dashboard controller to provide more realistic estimates when there's no sales data:

### New Logic
1. If there are actual sales data:
   - Calculate average daily consumption based on the past 30 days
   - Predict days until stockout based on current stock and consumption rate

2. If there's no sales data:
   - Estimate criticality based on tank fill percentage:
     - Tanks with < 20% fill → 5 days until stockout (critical)
     - Tanks with 20-49% fill → 10 days until stockout (low)
     - Tanks with ≥ 50% fill → 999 days until stockout (normal)

## Files Modified
- `backend/controllers/dashboardController.js` - Updated stock prediction calculation logic for both Super Admin and Admin/Operator roles

## Verification
The changes ensure that the critical stocks count in the dashboard now accurately reflects the actual status of tanks, even in the absence of sales data. Tanks with low fuel levels (< 20% capacity) will now be properly identified as critical and displayed in the dashboard summary.