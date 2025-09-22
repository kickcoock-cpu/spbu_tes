import React from 'react'
import { Outlet, useLocation } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'
import { SkipToMain } from '@/components/skip-to-main'
import { SearchProvider } from '@/context/search-provider'
import { LayoutProvider } from '@/context/layout-provider'
import { useMenuRefresh } from '@/hooks/use-menu'

interface MobileLayoutProps {
  children?: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { user, accessToken } = useAuthStore((state) => state.auth)
  const location = useLocation()
  
  // Refresh menu when user role changes
  useMenuRefresh()

  // If no user or token, redirect to login
  if (!user && !accessToken) {
    const currentPath = location.pathname + location.search
    if (!currentPath.includes('/sign-in')) {
      window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`
    }
    return null
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <div className="flex flex-col min-h-screen bg-background">
            <MobileHeader />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <SidebarInset className="flex-1 overflow-auto">
                <SkipToMain />
                <main className="p-4 md:p-6 pt-4 pb-16 w-full"> {/* Added padding bottom for bottom nav */}
                  {children ?? <Outlet />}
                </main>
              </SidebarInset>
            </div>
            <BottomNavigation />
          </div>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}