# Critical Stocks Fix - Enhanced Logic

## Issue
The critical stocks calculation was not working correctly because:
1. All tanks were showing `daysUntilStockout: 999` 
2. Even tanks with low fuel levels were not being classified as critical

## Root Cause
The issue was in the stock prediction logic:
1. When there was actual sales data, the system calculated days until stockout based on consumption
2. However, if the consumption rate was extremely low compared to tank capacity, the calculation resulted in unrealistically high numbers
3. For example: 1000L stock / 0.5L daily consumption = 2000 days until stockout
4. These tanks would never be classified as critical (≤5 days)

## Solution
Enhanced the stock prediction logic with a fallback mechanism:

### New Logic Flow
1. **If there's sales data and consumption > 0:**
   - Calculate days until stockout normally
   - **If result > 1000 days:** Fall back to percentage-based estimation
   - **Else:** Use the calculated value

2. **If there's no sales data or consumption = 0:**
   - Estimate based on tank fill percentage:
     - Tanks with < 20% fill → 5 days until stockout (critical)
     - Tanks with 20-49% fill → 10 days until stockout (low)
     - Tanks with ≥ 50% fill → 999 days until stockout (normal)

3. **Critical Stock Classification:**
   - Stocks with ≤ 5 days until stockout are classified as critical

## Files Modified
- `backend/controllers/dashboardController.js` - Enhanced stock prediction logic with fallback mechanism

## Verification
This fix ensures that:
1. Tanks with genuinely low consumption rates don't get incorrectly classified as having years of fuel
2. Tanks with low fuel levels (< 20% capacity) are properly identified as critical
3. The dashboard will now show actual critical stocks when tanks are running low