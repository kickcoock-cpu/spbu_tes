# Fix for Maximum Update Depth Exceeded Error

## Issue Identified
The "Maximum update depth exceeded" error was caused by an infinite loop in a useEffect hook that was setting state based on a dependency that was also being updated within the same effect.

## Problematic Code
```javascript
useEffect(() => {
  if (tanks.length > 0 && !formData.fuel_type) {
    const availableFuelTypes = Array.from(
      new Set(tanks.map(tank => tank.fuel_type))
    ).filter(Boolean) as string[]
    
    if (availableFuelTypes.length > 0) {
      setFormData(prev => ({
        ...prev,
        fuel_type: availableFuelTypes[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fuel_type: '__no_fuel_types__'
      }))
    }
  }
}, [tanks, formData.fuel_type]) // ← Problem: formData.fuel_type in dependencies
```

## Root Cause
The useEffect had `formData.fuel_type` in its dependency array, but it was also setting `formData.fuel_type` inside the effect. This created an infinite loop:

1. Effect runs when `formData.fuel_type` changes
2. Effect sets `formData.fuel_type` to a new value
3. Setting `formData.fuel_type` causes the effect to run again (because it's in dependencies)
4. This continues infinitely

## Solution Implemented
Removed `formData.fuel_type` from the dependency array:

```javascript
useEffect(() => {
  if (tanks.length > 0 && !formData.fuel_type) {
    const availableFuelTypes = Array.from(
      new Set(tanks.map(tank => tank.fuel_type))
    ).filter(Boolean) as string[]
    
    if (availableFuelTypes.length > 0) {
      setFormData(prev => ({
        ...prev,
        fuel_type: availableFuelTypes[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fuel_type: '__no_fuel_types__'
      }))
    }
  }
}, [tanks]) // ← Fixed: Removed formData.fuel_type from dependencies
```

## Why This Fix Works
1. The effect only needs to run when `tanks` data changes
2. The condition `!formData.fuel_type` already prevents unnecessary updates
3. Once `formData.fuel_type` is set, the effect won't run again even if tanks change
4. This breaks the infinite loop while maintaining the intended functionality

## Additional Safety
The condition `!formData.fuel_type` ensures that:
- The effect only runs when there's no fuel type selected yet
- It won't override a user's manual selection
- It only sets the initial value once

## Testing
After this fix, the component should:
- Load properly without infinite loops
- Set the initial fuel type correctly when tanks data is available
- Allow users to change the fuel type manually
- Not trigger the "Maximum update depth exceeded" error