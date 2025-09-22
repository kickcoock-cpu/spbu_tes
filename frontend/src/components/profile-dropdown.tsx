import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { user } = useAuthStore((state) => state.auth)
  const isMobile = useIsMobile()

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'SN'
    const name = user.accountNo || user.email || 'User'
    return name.substring(0, 2).toUpperCase()
  }

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'User'
    return user.accountNo || user.email || 'User'
  }

  // Get email
  const getEmail = () => {
    if (!user) return ''
    return user.email || ''
  }

  // Get user roles
  const getUserRoles = () => {
    if (!user || !user.role) return ['Operator']
    return user.role
  }

  // For desktop, we want a more prominent profile button
  if (!isMobile) {
    return (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant='ghost' 
              className='relative h-9 rounded-full px-2 py-1 hover:bg-accent hover:text-accent-foreground md:h-10'
            >
              <div className='flex items-center gap-2'>
                <Avatar className='h-7 w-7 md:h-8 md:w-8'>
                  <AvatarImage src='/avatars/01.png' alt={getDisplayName()} />
                  <AvatarFallback className='text-xs md:text-sm'>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className='hidden md:flex flex-col items-start gap-0.5'>
                  <span className='text-sm font-medium leading-none'>{getDisplayName()}</span>
                  <span className='text-xs text-muted-foreground leading-none'>
                    {getUserRoles()[0]}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className='w-64'
            align='end' 
            sideOffset={8}
            forceMount
          >
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col gap-1.5'>
                <p className='text-sm leading-none font-medium'>{getDisplayName()}</p>
                <p className='text-muted-foreground text-xs leading-none'>
                  {getEmail()}
                </p>
                <div className='flex flex-wrap gap-1 mt-1'>
                  {getUserRoles().map((role) => (
                    <span 
                      key={role} 
                      className='bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full'
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/settings/account'>
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/users'>
                  <span>User Management</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to='/spbu'>
                  <span>SPBU Management</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <span>Sign out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SignOutDialog open={!!open} onOpenChange={setOpen} />
      </>
    )
  }

  // Mobile version (unchanged)
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant='ghost' 
            className='relative h-8 w-8 rounded-full p-0'
          >
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt={getDisplayName()} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className='w-64 mx-2'
          align='end' 
          sideOffset={4}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{getDisplayName()}</p>
              <p className='text-muted-foreground text-xs leading-none'>
                {getEmail()}
              </p>
              <div className='flex flex-wrap gap-1 mt-1'>
                {getUserRoles().map((role) => (
                  <span 
                    key={role} 
                    className='bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full'
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings/account'>
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/users'>
                <span>User Management</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to='/spbu'>
                <span>SPBU Management</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
