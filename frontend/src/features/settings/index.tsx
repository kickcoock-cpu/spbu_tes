import { Outlet } from '@tanstack/react-router'
import { Monitor, Bell, Palette, Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { SidebarNav } from './components/sidebar-nav'
import { useIsMobile } from '@/hooks/use-mobile'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: '/settings/display',
    icon: <Monitor size={18} />,
  },
]

export function Settings() {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return (
      <Main fixed className="px-0">
        <div className='space-y-4 px-4 pt-2'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
            <p className='text-muted-foreground text-sm'>
              Manage your account settings and set e-mail preferences.
            </p>
          </div>
          <Separator className='my-2' />
          <div className='px-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main fixed fullWidth>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-4' />
        <div className='flex flex-1 flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-8'>
          <aside className='md:sticky md:top-0 md:w-64'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex-1 overflow-y-auto'>
            <Outlet />
          </div>
        </div>
      </div>
    </Main>
  )
}
