# Testing Critical Stocks Card Fix

## How to Test the Updated Critical Stocks Calculation

### 1. Verify Tank Status Calculation
1. Access the dashboard page
2. Check the browser console for the following logs:
   ```
   === DASHBOARD OVERVIEW ===
   Tank stocks: [ ... ]
   === CRITICAL STOCKS BY TANK STATUS ===
   Processing X tank stocks
   --- Checking tank: TankName ---
   Percentage: Y
   Is Critical: true/false
   Filtered critical tanks count: Z
   === END CRITICAL STOCKS BY TANK STATUS ===
   ```

### 2. Check Critical Stocks Count
1. Look at the "Critical Stocks" card in the dashboard summary
2. Verify that the count matches the number of tanks with <20% fill level
3. Compare with the console logs to ensure accuracy

### 3. Verify Critical Stock Alerts
1. If there are tanks with <20% fill level, check that they appear in the "Critical Stock Alerts" section
2. Verify that each alert shows:
   - Tank name
   - Current stock level
   - Tank capacity
   - Fill percentage
   - "Status: Critical (below 20% threshold)" message
   - "Order Now" button

### 4. Test Edge Cases
1. **No critical tanks**: Verify that when all tanks have ≥20% fill level:
   - Critical Stocks count shows 0
   - Critical Stock Alerts section shows "All fuel stocks are at healthy levels" message

2. **Multiple critical tanks**: Verify that when multiple tanks have <20% fill level:
   - Critical Stocks count shows the correct number
   - All critical tanks appear in the alerts section

3. **Boundary values**: Test tanks with exactly 20% fill level:
   - A tank with 20% should NOT be counted as critical
   - A tank with 19.9% should be counted as critical

### 5. Test "Order Now" Functionality
1. Click the "Order Now" button on a critical tank alert
2. Verify that it navigates to the deliveries page

### 6. Cross-Check with Tank Status Cards
1. Compare the critical stocks count with the tank status cards in the "Tank Status" section
2. Verify that all tanks marked as "Critical" in the status cards are included in the critical stocks count

## Expected Behavior

### When Critical Tanks Exist:
- Critical Stocks card shows count > 0
- Critical Stock Alerts section shows the critical tanks
- Each alert shows tank details and status
- "Order Now" buttons are functional

### When No Critical Tanks Exist:
- Critical Stocks card shows count = 0
- Critical Stock Alerts section shows "All fuel stocks are at healthy levels" message

## Troubleshooting

### If Count is Incorrect:
1. Check browser console for detailed logging
2. Verify that tank percentage values are correctly calculated
3. Confirm that the <20% threshold is being applied correctly

### If Alerts Don't Display:
1. Check that the tankStocks data is being passed correctly
2. Verify that the filtering logic is working
3. Confirm that the UI rendering is correct

### If "Order Now" Doesn't Work:
1. Check that the useNavigate hook is properly implemented
2. Verify that the navigation path is correct