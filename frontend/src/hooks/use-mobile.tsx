import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const result = window.innerWidth < MOBILE_BREAKPOINT
      console.log('Mobile detection - window.innerWidth:', window.innerWidth, 'MOBILE_BREAKPOINT:', MOBILE_BREAKPOINT, 'isMobile:', result)
      setIsMobile(result)
    }
    mql.addEventListener('change', onChange)
    onChange() // Call immediately to set initial value
    return () => mql.removeEventListener('change', onChange)
  }, [])

  console.log('useIsMobile returning:', !!isMobile)
  return !!isMobile
}
