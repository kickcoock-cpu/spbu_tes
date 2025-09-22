import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/deliveries/confirm')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState().auth
    
    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/deliveries/confirm',
        },
      })
    }
    
    // Only Operators should access this page
    if (!user.role.includes('Operator')) {
      throw redirect({
        to: '/403',
      })
    }
    
    // Check if user has access to deliveries
    const userHasAccess = hasAccess(user, 'deliveries')
    if (!userHasAccess) {
      throw redirect({
        to: '/403',
      })
    }
  },
})