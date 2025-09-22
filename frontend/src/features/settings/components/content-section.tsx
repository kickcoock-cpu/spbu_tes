import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
}

export function ContentSection({ title, desc, children }: ContentSectionProps) {
  const isMobile = useIsMobile()
  
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className={cn('font-medium', isMobile ? 'text-xl' : 'text-lg')}>
          {title}
        </h3>
        <p className={cn('text-muted-foreground', isMobile ? 'text-sm mt-1' : 'text-sm')}>
          {desc}
        </p>
      </div>
      <Separator className={cn('flex-none', isMobile ? 'my-4' : 'my-4 lg:my-6')} />
      <div className={cn(
        'h-full w-full overflow-y-auto scroll-smooth pb-12',
        isMobile ? 'pe-2 faded-bottom-mobile' : 'pe-4 faded-bottom'
      )}>
        <div className={cn(
          isMobile ? 'px-1' : '-mx-1 px-1.5 lg:max-w-xl'
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
