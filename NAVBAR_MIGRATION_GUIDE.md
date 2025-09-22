# Navbar Migration Guide

## Overview
This document describes the migration from manually added headers to a global navbar implementation.

## Migration Steps

### 1. Remove Manual Headers from Pages
Pages that previously included manual headers should remove them to avoid duplication:

#### Before (in page components)
```jsx
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

// In component render
<Header fixed>
  <Search />
  <div className='ms-auto flex items-center space-x-4'>
    <ThemeSwitch />
    <ConfigDrawer />
    <ProfileDropdown />
  </div>
</Header>
```

#### After (handled globally)
```jsx
// Remove manual header imports and usage
// Content renders directly without header wrapper
```

### 2. Updated Page Structure
Pages should now render content directly without header wrapper:

#### Before
```jsx
export function ExamplePage() {
  return (
    <>
      <Header fixed>
        {/* Header content */}
      </Header>
      <Main>
        {/* Page content */}
      </Main>
    </>
  )
}
```

#### After
```jsx
export function ExamplePage() {
  return (
    <Main>
      {/* Page content */}
    </Main>
  )
}
```

## Affected Pages

The following pages have been updated to remove manual headers:
- Tasks page (`/features/tasks/index.tsx`)
- Settings page (`/features/settings/index.tsx`)
- Chats page (`/features/chats/index.tsx`)
- Error pages (`/routes/_authenticated/errors/$error.tsx`)
- User management page (`/routes/clerk/_authenticated/user-management.tsx`)

## Testing

### Verification Steps
1. Navigate to various authenticated pages
2. Confirm navbar appears at top of all pages
3. Verify navbar components function correctly:
   - Search functionality
   - Theme switcher
   - Configuration drawer
   - Profile dropdown
4. Check mobile layout unchanged
5. Confirm no duplicate headers appear

### Expected Behavior
- Navbar consistently appears at top of all authenticated desktop pages
- No manual header implementation needed in individual pages
- Mobile experience unchanged
- All navbar components functional

## Rollback Plan

If issues arise, revert to manual header implementation:

1. Restore manual header imports in page components
2. Re-add header wrappers around page content
3. Remove global navbar from authenticated layout
4. Restore previous authenticated layout implementation

## Conclusion

This migration simplifies page development by:
1. Centralizing navbar management
2. Eliminating duplicate header implementations
3. Ensuring consistent navbar across all pages
4. Reducing boilerplate code in individual pages

Developers should no longer add manual headers to authenticated pages as they are now handled globally.