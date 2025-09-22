# Tank Status Dashboard Fix

## Issue
The tank status visualization in the dashboard was not consistent with the detailed tank visualization on the tanks page. The issues included:

1. Different status thresholds and color schemes
2. Incorrect labeling ("Available" instead of "Current Stock")
3. Less detailed visualization without wave effects and measurement lines
4. Inconsistent status text display

## Changes Made

### 1. Updated Status Thresholds and Colors
Made the dashboard tank status card consistent with the detailed visualization:
- Critical: < 20% (red)
- Low: 20-49% (yellow)
- Normal: 50-79% (blue)
- Good: ≥ 80% (green)

### 2. Fixed Labeling
Changed "Available" to "Current Stock" to accurately reflect the displayed value.

### 3. Enhanced Visualization
Added several visual enhancements to make the dashboard tank cards more consistent with the detailed view:
- Wave animation effect on the fuel surface
- Measurement lines at 0%, 25%, 50%, 75%, and 100%
- Horizontal fill level indicator bar
- Consistent status text display (e.g., "Critical (15.5%)")

### 4. Improved Information Display
Added proper icons and layout matching the detailed visualization:
- Fuel type icons
- Capacity and current stock display
- Fill level percentage with visual indicator

## Files Modified
- `frontend/src/features/dashboard/components/tank-status-card.tsx`

## Verification
The changes ensure that the tank status displayed in the dashboard now accurately reflects the actual API data and is visually consistent with the detailed tank visualization on the tanks page.