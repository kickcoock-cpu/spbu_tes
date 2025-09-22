import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { useMenuRefresh } from '@/hooks/use-menu'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { useIsMobile } from '@/hooks/use-mobile'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { user, accessToken, setUser, setAccessToken } = useAuthStore((state) => state.auth)
  const [isInitializing, setIsInitializing] = useState(true)
  const isMobile = useIsMobile()

  // Refresh menu when user role changes
  useMenuRefresh()
  
  // Initialize user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const cookieToken = getCookie('accessToken')
        
        // If we have a token but no user data, fetch user data
        if ((accessToken || cookieToken) && !user) {
          // Set token from cookie if needed
          if (cookieToken && !accessToken) {
            setAccessToken(cookieToken)
          }
          
          // Fetch user data from backend
          const response = await authApi.getMe()
          const userData = response.data.data
          
          // Transform user data
          const transformedUser = {
            accountNo: userData.username,
            email: userData.email || '',
            role: [userData.Role?.name || 'Operator'], // Default to Operator if no role
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
          }
          
          setUser(transformedUser)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsInitializing(false)
      }
    }
    
    // Initialize auth
    initializeAuth()
  }, [user, accessToken, setUser, setAccessToken])

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <div className="ml-4">Loading user data...</div>
      </div>
    )
  }
  
  // If no user or token, redirect to login (handled in route)
  if (!user) {
    return null
  }
  
  // Use mobile layout for mobile devices
  if (isMobile) {
    return (
      <MobileLayout>
        {children ?? <Outlet />}
      </MobileLayout>
    )
  }
  
  // Desktop layout
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <div className="flex flex-col h-full w-full">
            <Header fixed className="w-full">
              <div className='ms-auto flex items-center space-x-2 sm:space-x-3 md:space-x-4'>
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
              </div>
            </Header>
            <SidebarInset
              className={cn(
                'flex-1',
                'has-[[data-layout=fixed]]:h-svh',
                'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',
                '@container/content'
              )}
            >
              {children ?? <Outlet />}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}