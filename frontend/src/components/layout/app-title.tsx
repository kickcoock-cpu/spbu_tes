import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar'
import { SimontoKLogo } from '@/assets/custom/simontok-logo'
import '@/assets/custom/simontok-styles.css'

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <SimontoKLogo size={24} className="navbar-logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold truncate">SimontoK</span>
              <span className="text-xs text-muted-foreground truncate">
                Sistem Monitoring BBK
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}