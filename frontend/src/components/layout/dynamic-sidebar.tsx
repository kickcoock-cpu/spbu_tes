import React from 'react'
import { useLayout } from '@/context/layout-provider'
import { Sidebar, SidebarMenuSkeleton } from '@/components/ui/sidebar'
import { useMenu } from '@/hooks/use-menu'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { 
  LayoutDashboard,
  ListTodo,
  Package,
  MessagesSquare,
  Users,
  ShieldCheck,
  Bug,
  Settings,
  HelpCircle,
  Construction,
  Lock,
  UserX,
  FileX,
  ServerOff,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
  Command,
  Tag,
  BarChart,
  Calendar,
  LogIn,
  LogOut,
  History,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type NavItem, type ApiMenuItem } from './types'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'
import { useIsMobile } from '@/hooks/use-mobile'

// Map icon names to actual components
const iconMap: Record<string, React.ElementType> = {
  'dashboard': LayoutDashboard,
  'list': ListTodo,
  'package': Package,
  'messages-square': MessagesSquare,
  'users': Users,
  'shield-check': ShieldCheck,
  'bug': Bug,
  'settings': Settings,
  'help-circle': HelpCircle,
  'construction': Construction,
  'lock': Lock,
  'user-x': UserX,
  'file-x': FileX,
  'server-off': ServerOff,
  'user-cog': UserCog,
  'wrench': Wrench,
  'palette': Palette,
  'bell': Bell,
  'monitor': Monitor,
  'command': Command,
  'clerk': ClerkLogo,
  'group': Users,
  'business': Command,
  'shopping_cart': Package,
  'local_shipping': Package, // Replacing LocalShipping with Package
  'account_balance': Command, // Replacing AccountBalance with Command
  'tag': Tag,
  'bar_chart': BarChart,
  'show_chart': BarChart, // Using BarChart as fallback
  'event_available': Calendar, // Replacing EventAvailable with Calendar
  'login': LogIn,
  'logout': LogOut,
  'history': History,
  'trending_up': TrendingUp,
  'query_stats': Activity,
  'add': Plus,
}

// Check if user has admin or super admin role
const isUserAdminOrSuperAdmin = (user: any): boolean => {
  if (!user || !user.role || !Array.isArray(user.role)) return false;
  
  return user.role.some((role: string) => 
    role === 'Super Admin' || role === 'Admin'
  );
}

export function DynamicSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsible, variant } = useLayout()
  const { menuItems, isLoading, error } = useMenu()
  const { user } = useAuthStore((state) => state.auth)
  const isMobile = useIsMobile()

  // Show skeleton loading state
  if (isLoading) {
    return (
      <Sidebar 
        {...props} 
        collapsible={collapsible} 
        variant={variant}
        className={isMobile ? "" : "sidebar-white-red md:mr-4 sm:mr-3 mr-2"}
      >
        <div className="flex flex-col gap-2 p-2">
          {[...Array(5)].map((_, i) => (
            <SidebarMenuSkeleton key={i} showIcon={true} className="sidebar-slide-in" />
          ))}
        </div>
      </Sidebar>
    )
  }

  // Show error state
  if (error) {
    return (
      <Sidebar 
        {...props} 
        collapsible={collapsible} 
        variant={variant}
        className={isMobile ? "" : "sidebar-white-red md:mr-4 sm:mr-3 mr-2"}
      >
        <div className="flex flex-col gap-2 p-2">
          <div className="text-sm text-red-500">Failed to load menu</div>
        </div>
      </Sidebar>
    )
  }

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item: ApiMenuItem) => {
    // If user is not available, show all items (fallback)
    if (!user) {
      return true
    }
    
    // Check if user has access to this menu item based on permission
    if (item.permission) {
      return hasAccess(user, item.permission)
    }
    
    // If no permission is specified, show the item
    return true
  })

  // Convert API menu items to NavGroup format
  const navGroups = [
    {
      title: 'Menu',
      items: filteredMenuItems.map((item: ApiMenuItem) => convertMenuItemToNavItem(item))
    }
  ]

  return (
    <Sidebar 
      {...props} 
      collapsible={collapsible} 
      variant={variant}
      className={isMobile ? "" : "sidebar-white-red"}
    >
      {/* Header with app title */}
      <div className="flex flex-col gap-2 p-2">
        <AppTitle />
      </div>
      
      {/* Menu items */}
      <div className="flex flex-col gap-2 p-2 flex-1">
        {navGroups.map((group, index) => (
          <NavGroup key={group.title} {...group} className="sidebar-slide-in" style={{ animationDelay: `${index * 0.1}s` }} />
        ))}
      </div>
      
      {/* Footer - removed user info to avoid duplication with header profile */}
      {!isMobile && (
        <div className="flex flex-col gap-2 p-2">
          {/* Profile moved to header to avoid duplication */}
        </div>
      )}
    </Sidebar>
  )
}

// Helper function to convert API menu item to NavItem format
function convertMenuItemToNavItem(item: ApiMenuItem): NavItem {
  // If item has submenu, convert it recursively
  if (item.submenu && item.submenu.length > 0) {
    return {
      title: item.label,
      icon: iconMap[item.icon] || Package, // Default icon if not found
      items: item.submenu.map((subItem: ApiMenuItem) => ({
        title: subItem.label,
        url: subItem.route,
        icon: iconMap[subItem.icon] || Package, // Default icon if not found
      })),
    }
  }
  
  // Regular menu item
  return {
    title: item.label,
    url: item.route,
    icon: iconMap[item.icon] || Package, // Default icon if not found
  }
}