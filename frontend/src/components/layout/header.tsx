import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import '@/assets/custom/simontok-styles.css'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-full',
        'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-2 p-2 sm:gap-3 sm:p-3 md:gap-4 md:p-4',
          'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg',
          '@container/header'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        <div className='flex w-full items-center justify-end'>
          {children}
        </div>
      </div>
    </header>
  )
}
