# Mobile Operator Tank Stock Component

## Overview
This component displays the remaining stock tanks for mobile sales operators with their relationships. It provides a mobile-friendly interface for operators to view current fuel levels in tanks assigned to their SPBU.

## Features
1. **Real-time Tank Stock Display**: Shows current stock levels for all tanks in the operator's assigned SPBU
2. **Search Functionality**: Allows operators to search for specific tanks by name, fuel type, or SPBU
3. **Visual Status Indicators**: 
   - Critical (red): < 20% fill level
   - Low (yellow): 20-49% fill level
   - Normal (blue): 50-79% fill level
   - Good (green): ≥ 80% fill level
4. **Tank Details**: Displays tank name, fuel type, current stock, capacity, and SPBU information
5. **Visual Progress Bar**: Shows fill level with a color-coded progress bar
6. **Auto-refresh**: Updates data every 30 seconds to ensure operators have current information

## Component Structure
- **File**: `frontend/src/features/tanks/components/mobile-operator-tank-stock.tsx`
- **Props**: 
  - `onTankSelect` (optional): Callback function when a tank is selected

## Data Flow
1. Fetches tank data from `/api/tanks` endpoint
2. Filters tanks to only show those from the operator's assigned SPBU (handled by backend)
3. Calculates fill percentages for each tank
4. Applies status colors based on fill levels
5. Filters tanks based on search term

## Usage
The component can be imported and used in mobile sales operator pages:

```tsx
import { MobileOperatorTankStock } from '@/features/tanks/components/mobile-operator-tank-stock'

// In your component
<MobileOperatorTankStock 
  onTankSelect={(tank) => console.log('Selected tank:', tank)} 
/>
```

## Styling
- Mobile-first responsive design
- Touch-friendly card-based layout
- Color-coded status badges
- Visual progress indicators
- Consistent with existing mobile UI components

## Error Handling
- Loading states with spinner animation
- Error states with retry button
- Empty states with appropriate messaging
- Graceful handling of missing data

## Technical Details
- Uses React Query for data fetching and caching
- Implements proper TypeScript typing
- Follows existing code patterns and conventions
- Uses Lucide React icons for visual elements
- Leverages existing UI components from the component library