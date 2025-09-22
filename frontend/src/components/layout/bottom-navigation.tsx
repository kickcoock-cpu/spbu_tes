import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Home, Fuel, Package, User, BarChart3, DollarSignIcon, DollarSign, CarTaxiFront, BadgeDollarSign, WandSparklesIcon, ShoppingCart, PercentIcon, TruckIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'
import { cn } from '@/lib/utils'
import { MobileIcon } from '@radix-ui/react-icons'
import { TankTruckAnimation } from '../TankTruckAnimation'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
  permissionKey?: string // Optional permission key for more granular access control
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: <Home className="h-5 w-5" />,
    roles: ['Super Admin', 'Admin']
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ['Super Admin', 'Admin', 'Operator'],
    permissionKey: 'sales'
  },
  {
    title: 'Deliveries',
    href: '/deliveries',
    icon: <TruckIcon className="h-5 w-5" />,
    roles: ['Super Admin', 'Admin', 'Operator'],
    permissionKey: 'deliveries'
  },
  {
    title: 'Deposits',
    href: '/deposits',
    icon: <DollarSign className="h-5 w-5" />,
    roles: ['Super Admin', 'Admin', 'Operator'],
    permissionKey: 'deposits'
  },
  {
    title: 'Reports',
    href: '/reports/sales',
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ['Super Admin', 'Admin', 'Operator']
  },
   {
    title: 'Gain/Loss',
    href: '/adjustments',
    icon: <PercentIcon className="h-5 w-5" />,
    roles: ['Operator']
  }
]

export function BottomNavigation() {
  const location = useLocation()
  const { user } = useAuthStore((state) => state.auth)

  // Filter navigation items based on user role and permissions
  const filteredNavItems = navItems.filter(item => {
    if (!user) return false
    
    // Check if user has the required role
    const hasRequiredRole = item.roles.some(role => user.role.includes(role))
    
    // If item has a permission key, check if user has access to that resource
    if (item.permissionKey) {
      return hasRequiredRole && hasAccess(user, item.permissionKey)
    }
    
    // If no permission key, just check role
    return hasRequiredRole
  })

  // If no items or only one item, don't show navigation
  if (filteredNavItems.length <= 1) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-2 text-xs transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn('mb-1', isActive ? 'text-white' : 'text-gray-500')}>
                {item.icon}
              </div>
              <span className={cn(isActive ? 'font-medium text-white' : '')}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}