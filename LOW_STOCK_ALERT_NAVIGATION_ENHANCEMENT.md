# Low Stock Alert Navigation Enhancement

## Feature Description

This enhancement adds clickable functionality to low stock alerts in the tank visualization view. When a tank's fuel level drops below 20%, users can click on the alert to be automatically navigated to the deliveries management page with pre-populated information.

## Implementation Details

### 1. Tank Visualization Component Updates

**File:** `frontend/src/components/tanks/TankVisualization.tsx`

**Changes Made:**
- Added `useNavigate` hook from `@tanstack/react-router`
- Modified `handleLowStockClick` function to navigate to deliveries page
- Pass tank information (ID, name, fuel type, current stock) via navigation state
- Made both the alert icon and alert message clickable
- Added visual feedback with hover effects

### 2. Deliveries Management Page Updates

**File:** `frontend/src/features/deliveries-management/deliveries-management-page.tsx`

**Changes Made:**
- Added `useLocation` hook to access navigation state
- Added `useEffect` to check for tank information in navigation state
- Pre-populate create delivery form with fuel type from tank
- Automatically open create delivery dialog when coming from low stock alert
- Show informational toast notification with tank details

## User Experience

### Workflow
1. User views tanks in visualization mode
2. Tanks with stock below 20% show a pulsing red alert icon
3. User clicks on either the alert icon or the alert message
4. User is navigated to the deliveries management page
5. Create delivery dialog automatically opens
6. Fuel type is pre-selected based on the tank's fuel type
7. Informational toast shows details about the low stock tank

### Visual Feedback
- **Alert Icon:** Pulsing red triangle with hover effect
- **Alert Message:** Clickable card with hover effect
- **Navigation:** Smooth transition to deliveries page
- **Form Pre-population:** Fuel type automatically selected
- **Notification:** Toast message with tank details

## Technical Implementation

### Navigation State Structure
```javascript
{
  fromTank: {
    tankId: number,
    tankName: string,
    fuelType: string,
    currentStock: number
  }
}
```

### Data Flow
1. TankVisualization detects low stock condition
2. User clicks alert element
3. Navigation to `/deliveries` with tank data in state
4. Deliveries page reads state and pre-populates form
5. Create dialog automatically opens
6. User completes delivery creation

## Benefits

### User Experience Improvements
- **Reduced Steps:** One click from alert to delivery creation
- **Error Prevention:** Automatic form pre-population reduces input errors
- **Context Preservation:** User maintains context of which tank needs attention
- **Time Savings:** Eliminates manual data entry for fuel type

### System Benefits
- **Workflow Efficiency:** Streamlined process for handling low stock situations
- **Data Consistency:** Ensures correct fuel type is associated with delivery
- **User Guidance:** Clear path for resolving low stock alerts

## Testing

### Test Scenarios
1. **Low Stock Detection:** Verify alerts appear when stock drops below 20%
2. **Navigation:** Confirm clicking alert navigates to deliveries page
3. **State Transfer:** Ensure tank information is correctly passed
4. **Form Pre-population:** Verify fuel type is correctly selected
5. **Dialog Auto-open:** Confirm create dialog opens automatically
6. **Toast Notification:** Verify informational message appears

### Edge Cases
- **Multiple Low Stock Tanks:** Each tank should navigate independently
- **Page Refresh:** State should persist during navigation
- **Authorization:** Only authorized users should see create dialog
- **Invalid Data:** Handle cases where tank data is incomplete

This enhancement significantly improves the user experience for managing low stock situations by providing a direct, intuitive path from alert to resolution.