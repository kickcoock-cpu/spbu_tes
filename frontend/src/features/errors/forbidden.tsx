import { useEffect } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useIsMobile } from '@/hooks/use-mobile'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { user } = useAuthStore().auth
  const isMobile = useIsMobile()

  // Check if user is an operator on mobile device and redirect to sales page
  useEffect(() => {
    if (user && isMobile) {
      // Check if user is an operator
      const isOperator = user.role && user.role.includes('Operator')
      
      if (isOperator) {
        // Redirect to sales page for operators on mobile
        navigate({ to: '/sales' })
      }
    }
  }, [user, isMobile, navigate])

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>Access Forbidden</span>
        <p className='text-muted-foreground text-center'>
          You don't have necessary permission <br />
          to view this resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
