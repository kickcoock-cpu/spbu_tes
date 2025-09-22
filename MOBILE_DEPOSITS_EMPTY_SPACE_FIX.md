# Mobile Deposits View Empty Space Fix

## Issue Description
The mobile deposits view had empty space on the right side, making the layout appear incomplete and unbalanced.

## Root Cause
The issue was caused by a combination of factors:
1. Width constraints in parent containers
2. Missing explicit width declarations on key components
3. Potential overflow handling that was cutting off content

## Solution Implemented

### 1. Main Component Container
Added `w-full` class to ensure the main component takes the full available width:
```html
<div className="flex flex-col gap-6 w-full">
```

### 2. Card Component
Ensured each deposit card takes the full width:
```html
<Card key={deposit.id} className="w-full overflow-hidden shadow-sm">
```

### 3. Grid Container
Wrapped the grid in a width-constrained container to prevent any overflow issues:
```html
<CardContent className="pb-4">
  <div className="w-full">
    <div className="grid grid-cols-2 gap-3">
      <!-- Grid items -->
    </div>
  </div>
</CardContent>
```

### 4. Parent Containers
Ensured parent containers in the deposits management page also take full width:
```html
<div className="space-y-6 w-full">
  <MobileDepositsList ... />
</div>
```

## Layout Structure
The grid layout was maintained as:
- Row 1: Amount | Method
- Row 2: Operator | ID
- Row 3: Approved By (spans 2 columns)
- Row 4: Rejected By (spans 2 columns)

## Files Modified
1. `/frontend/src/features/deposits-management/components/mobile-deposits-list.tsx`
2. `/frontend/src/features/deposits-management/deposits-management-page.tsx`

## Result
The mobile deposits view now properly utilizes the full screen width without empty spaces on the right side, providing a balanced and professional appearance on all mobile devices.