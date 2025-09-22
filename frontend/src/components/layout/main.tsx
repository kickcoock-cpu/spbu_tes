import { cn } from '@/lib/utils'

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  fullWidth?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Main({ fixed, className, fluid, fullWidth, ...props }: MainProps) {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        '@container/main px-4 py-6',

        // If layout is fixed, make the main container flex and grow
        fixed && 'flex grow flex-col overflow-hidden',

        // If layout is not fluid, set the max-width
        !fluid && !fullWidth &&
          '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
          
        // If fullWidth is true, remove max-width constraints and use full padding
        fullWidth && 'w-full max-w-full px-4 md:px-6 lg:px-8',
        className
      )}
      {...props}
    />
  )
}
