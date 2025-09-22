import { useLayout } from '@/context/layout-provider'
import { Sidebar } from '@/components/ui/sidebar'
import { DynamicSidebar } from './dynamic-sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Safely use useLayout hook with error handling
  let layoutProps = { collapsible: 'offcanvas' as const, variant: 'sidebar' as const }
  try {
    layoutProps = useLayout()
  } catch (error) {
    // If useLayout fails (e.g., not within LayoutProvider), use default values
    console.warn('LayoutProvider not found, using default layout props')
  }
  
  const { collapsible, variant } = layoutProps
  const { user, accessToken } = useAuthStore((state) => state.auth)
  const isMobile = useIsMobile()
  
  // Use dynamic sidebar when user is authenticated
  if (user && accessToken) {
    // For mobile, always use sidebar without margin
    if (isMobile) {
      return (
        <DynamicSidebar 
          {...props} 
          collapsible={collapsible} 
          variant={variant}
        />
      )
    }
    
    // For desktop, no extra margins to prevent empty space
    return (
      <DynamicSidebar 
        {...props} 
        collapsible={collapsible} 
        variant={variant}
      />
    )
  }
  
  // For mobile, use sidebar without special styling
  if (isMobile) {
    return (
      <Sidebar 
        {...props} 
        collapsible={collapsible} 
        variant={variant}
      />
    )
  }
  
  // Use static sidebar for unauthenticated users with white background
  return (
    <Sidebar 
      {...props} 
      collapsible={collapsible} 
      variant={variant}
      className="sidebar-white-red"
    />
  )
}
