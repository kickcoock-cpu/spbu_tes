import React from 'react'
import { Button } from '@/components/ui/button'
import { Home, PanelLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SimontoKLogo } from '@/assets/custom/simontok-logo'
import '@/assets/custom/simontok-styles.css'

export function MobileHeader() {
  const { user } = useAuthStore((state) => state.auth)
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <SimontoKLogo size={32} className="navbar-logo" />
            <div className="flex flex-col">
              <span className="font-semibold">SimontoK</span>
              <span className="text-xs text-muted-foreground">
                Sistem Monitoring BBK
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </a>
          </Button>
          {user && <ProfileDropdown />}
        </div>
      </div>
    </header>
  )
}