import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'

export const Route = createFileRoute('/_authenticated/prediction/sales')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState().auth
    
    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/prediction/sales',
        },
      })
    }
    
    // Check if user has access to predictions
    const userHasAccess = hasAccess(user, 'prediction')
    if (!userHasAccess) {
      throw redirect({
        to: '/403',
      })
    }
  },
})