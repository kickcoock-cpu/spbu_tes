import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'

export const Route = createFileRoute('/_authenticated/prices')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState().auth
    
    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/prices',
        },
      })
    }
    
    // Check if user has access to prices management
    const userHasAccess = hasAccess(user, 'prices')
    if (!userHasAccess) {
      // Instead of redirecting to the dashboard, show a 403 error page
      throw redirect({
        to: '/403',
      })
    }
  },
})