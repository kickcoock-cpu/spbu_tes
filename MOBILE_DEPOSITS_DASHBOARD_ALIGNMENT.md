# Mobile Deposits Layout Alignment with Dashboard

## Overview
This document describes how the mobile deposits list layout has been aligned with the dashboard layout to ensure consistent UI/UX across the application.

## Changes Made

### 1. Container Structure Alignment
Both components now use similar container structures:
- Main container: `space-y-6` for consistent vertical spacing
- Section title container: `px-4 pt-2` with proper heading hierarchy
- Search bar container: `px-4` with consistent styling
- List container: `px-4 space-y-4` for card spacing

### 2. Responsive Grid Layout
The deposits list now uses a responsive grid layout similar to the dashboard:
```html
<div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
```

This ensures:
- 2 columns on mobile devices
- 4 columns on larger screens
- Consistent gap spacing

### 3. Card Structure Consistency
Both components use the same card structure:
- Card: `w-full overflow-hidden shadow-sm`
- CardHeader: Consistent padding
- CardContent: `pb-4` for bottom spacing

### 4. Typography and Spacing
Both components use consistent typography:
- Section titles: `text-2xl font-bold`
- Descriptions: `text-muted-foreground text-sm mt-1`
- Card headers: Consistent font sizes and weights
- Grid items: `text-sm` with proper hierarchy

### 5. Empty State Design
Both components use similar empty state designs:
- Centered icons with appropriate sizing
- Descriptive text with consistent styling
- Proper padding and spacing

### 6. Responsive Design Patterns
Both components follow the same responsive design patterns:
- Mobile-first approach
- Consistent breakpoints
- Proper spacing at all screen sizes
- Unified visual language

## Files Modified
1. `/frontend/src/features/deposits-management/components/mobile-deposits-list.tsx`

## Layout Structure
The aligned responsive grid layout:
- Mobile (2 columns): Amount | Method
                   Operator | ID
                   Approved By (spans 2) | Rejected By (spans 2)
- Desktop (4 columns): Amount | Method | Operator | ID
                     Approved By (spans 2) | Rejected By (spans 2)

## Result
The mobile deposits view now has a consistent look and feel with the dashboard, providing a unified user experience across the application.

## Benefits
- Consistent UI/UX across mobile views
- Better responsive design that adapts to different screen sizes
- Easier maintenance and updates
- Better user experience with familiar patterns
- Reduced cognitive load for users
- Unified design language throughout the application