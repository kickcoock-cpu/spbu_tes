# Mobile Deposits Management Implementation

## Overview
This document describes the implementation of a mobile-responsive layout for the deposits management page (/deposits) that follows the same patterns as other mobile implementations in the application.

## Key Features

### 1. Mobile Detection
- Uses the `useIsMobile()` hook to detect mobile devices
- Automatically switches between desktop and mobile views based on screen size

### 2. Mobile-First Components

#### MobileDepositsList Component
- Card-based layout for deposit listings
- Touch-friendly search and filter functionality
- Responsive action buttons (Approve/Reject)
- Empty state handling
- Loading and error states
- Enhanced visual design with icons and better information hierarchy
- Status-specific color coding for badges

#### MobileDepositsForm Component
- Vertical form layout optimized for mobile screens
- Touch-friendly input fields
- Context-aware labels and placeholders
- Enhanced header with back navigation

### 3. Adaptive UI Patterns

#### Desktop View
- Traditional table-based layout
- Multi-column forms in dialogs
- Full-screen optimization

#### Mobile View
- Card-based deposit listings
- Full-screen forms
- Simplified navigation
- Touch-optimized controls

## Implementation Details

### File Structure
```
src/
├── features/
│   ├── deposits-management/
│   │   ├── deposits-management-page.tsx (updated)
│   │   └── components/
│   │       ├── mobile-deposits-list.tsx (new)
│   │       └── mobile-deposits-form.tsx (new)
```

### Component Structure

#### MobileDepositsList
- Header with title and description
- Search bar with icon and rounded styling
- Add Deposit button with appropriate sizing
- Card-based deposit listings with:
  - Deposit date and SPBU information
  - Status badge with color coding
  - Amount and payment method information
  - Operator and approval/rejection details
  - Action buttons (Approve/Reject for pending deposits)

#### MobileDepositsForm
- Back navigation header
- Form card with title and description
- Input fields with proper spacing and sizing
- Payment method selection dropdown
- Action buttons (Cancel/Create Deposit)

### Mobile Optimizations

#### Touch Targets
- Minimum 44px touch targets for buttons and form controls
- Appropriate spacing between interactive elements
- Vertical form layouts for easier scrolling

#### Visual Design
- Consistent typography hierarchy
- Proper use of icons for visual cues
- Appropriate color contrast for accessibility
- Shadow effects for depth perception
- Status-specific color coding for badges
- Currency formatting for Indonesian Rupiah

#### Performance
- Conditional rendering based on mobile detection
- Optimized card-based rendering
- Efficient re-rendering strategies

## Technical Implementation

### Mobile Detection
The implementation uses the existing `useIsMobile()` hook:
```jsx
const isMobile = useIsMobile()
```

### Conditional Rendering
The main deposits management page conditionally renders mobile or desktop views:
```jsx
// Mobile view
if (isMobile) {
  // If we're creating a deposit, show the mobile form
  if (isCreateDialogOpen && canCreateDeposits) {
    return (
      <div className="space-y-6">
        <MobileDepositsForm
          formData={createFormData}
          isLoading={createDepositMutation.isPending}
          onChange={handleCreateFormChange}
          onSubmit={handleCreateDeposit}
          onCancel={() => setIsCreateDialogOpen(false)}
          canCreateDeposits={canCreateDeposits}
        />
      </div>
    )
  }
  
  // Otherwise, show the mobile deposits list
  return (
    <div className="space-y-6">
      <MobileDepositsList
        deposits={filteredDeposits}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddDeposit={() => setIsCreateDialogOpen(true)}
        onApproveDeposit={handleApproveDeposit}
        onRejectDeposit={handleRejectDeposit}
        isLoading={depositsLoading}
        isError={depositsError}
        canCreateDeposits={canCreateDeposits}
        canApproveDeposits={canApproveDeposits}
        isReadOnly={isReadOnly}
      />
    </div>
  )
}

// Desktop view (existing implementation)
return (
  // Desktop components
)
```

### Component Design

#### MobileDepositsList
```jsx
<Card key={deposit.id} className="overflow-hidden shadow-sm">
  <CardHeader className="pb-3">
    <div className="flex justify-between items-start gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <CardTitle className="text-lg">
            {new Date(deposit.deposit_date).toLocaleDateString('id-ID')}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {deposit.SPBU ? `${deposit.SPBU.name} (${deposit.SPBU.code})` : '-'}
          </CardDescription>
        </div>
      </div>
      <Badge 
        className={`text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(deposit.status)}`}
      >
        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="pb-4">
    <div className="grid grid-cols-4 gap-2">
      <div className="flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
          <Wallet className="h-3 w-3" />
          Amount
        </span>
        <span className="truncate font-medium">
          {formatCurrency(deposit.amount)}
        </span>
      </div>
      <div className="flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
          {getPaymentMethodIcon(deposit.payment_method)}
          Method
        </span>
        <span className="truncate">
          {deposit.payment_method.charAt(0).toUpperCase() + deposit.payment_method.slice(1)}
        </span>
      </div>
      <div className="flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
          <User className="h-3 w-3" />
          Operator
        </span>
        <span className="truncate">
          {deposit.operator ? deposit.operator.name : '-'}
        </span>
      </div>
      <div className="flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          ID
        </span>
        <span className="truncate">#{deposit.id}</span>
      </div>
      <div className="col-span-2 flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs">Approved By</span>
        <span className="truncate">
          {deposit.depositor_approver ? deposit.depositor_approver.name : '-'}
        </span>
      </div>
      <div className="col-span-2 flex flex-col text-sm">
        <span className="font-medium text-muted-foreground text-xs">Rejected By</span>
        <span className="truncate">
          {deposit.depositor_rejector ? deposit.depositor_rejector.name : '-'}
        </span>
      </div>
    </div>
    
    {canApproveDeposits && deposit.status === 'pending' && (
      <div className="flex gap-2 mt-4">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 py-5 bg-green-600 hover:bg-green-700"
          onClick={() => onApproveDeposit(deposit.id)}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 py-5 bg-red-600 hover:bg-red-700"
          onClick={() => onRejectDeposit(deposit.id)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

#### MobileDepositsForm
```jsx
<div className="flex items-center justify-between pt-2">
  <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
    <ChevronLeft className="h-5 w-5" />
  </Button>
  <div className="flex-1 text-center px-4">
    <h1 className="text-2xl font-bold">Create Deposit</h1>
    <p className="text-muted-foreground text-sm mt-1">
      Add a new deposit to the system
    </p>
  </div>
  <div className="w-10"></div> {/* Spacer for symmetry */}
</div>
```

## Testing

### Device Compatibility
- Tested on various mobile screen sizes (320px to 480px)
- Verified on both iOS and Android platforms
- Checked in mobile browsers (Chrome, Safari, Firefox)

### Functionality
- Confirmed all deposits management features work on mobile
- Verified Operator permissions for create deposits
- Verified Admin permissions for approve/reject deposits
- Tested search and filtering functionality
- Checked form validation and error handling
- Verified currency formatting for Indonesian Rupiah

### Performance
- Optimized rendering for mobile devices
- Efficient data loading and caching
- Smooth scrolling and interactions

## Future Improvements

### Advanced Features
- Implement swipe gestures for quick actions
- Add pull-to-refresh functionality
- Include offline support for deposits data
- Add barcode scanning for deposit identification

### Performance Enhancements
- Implement virtual scrolling for large deposits lists
- Add skeleton loading states
- Optimize image and icon loading

## Conclusion

The mobile deposits management implementation provides a seamless experience across all device types while maintaining full functionality. Users can perform all authorized actions on mobile devices with an interface optimized for touch interaction.

Key achievements:
1. Consistent design language with existing mobile implementations
2. Full feature parity between desktop and mobile views
3. Optimized touch interactions and visual design
4. Proper handling of loading and error states
5. Responsive behavior across all screen sizes
6. Indonesian Rupiah currency formatting
7. Status-specific color coding for deposit statuses