# Mobile Deposits List Alignment with Deliveries

## Overview
This document describes how the mobile deposits list has been aligned with the mobile deliveries list to ensure consistent UI/UX across the application.

## Changes Made

### 1. Grid Layout Alignment
Both components now use the same grid structure:
```html
<div className="grid grid-cols-4 gap-2">
```

### 2. Container Structure
Both components use identical container structures:
- Section title container: `px-4 pt-2`
- Search bar container: `px-4`
- Main list container: `px-4 flex flex-col gap-4 pb-4`

### 3. Card Structure
Both components use the same card structure:
- Card: `w-full overflow-hidden shadow-sm`
- CardHeader: `pb-3`
- CardContent: `pb-4`

### 4. Spacing and Padding
Both components use consistent spacing:
- Section title: Standard padding
- Search bar: Standard padding with rounded input
- List items: `gap-4` between cards
- Card content: `gap-2` between grid items

### 5. Empty State
Both components use similar empty state designs:
- Icon centered with appropriate size
- Descriptive text
- Consistent padding

### 6. Grid Item Structure
Both components use the same grid item structure with:
- Icon + label in the header
- Value below the label
- Truncation for long values
- Consistent typography

## Files Modified
1. `/frontend/src/features/deposits-management/components/mobile-deposits-list.tsx`

## Layout Structure
The aligned grid layout:
- Row 1: Amount | Method | Operator | ID
- Row 2: Approved By (spans 2 columns) | Rejected By (spans 2 columns)

## Result
The mobile deposits view now has a consistent look and feel with the mobile deliveries view, providing a unified user experience across the application.

## Benefits
- Consistent UI/UX across mobile views
- Easier maintenance and updates
- Better user experience with familiar patterns
- Reduced cognitive load for users
- Unified design language