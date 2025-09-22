import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'

export const Route = createFileRoute('/_authenticated/sales')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState().auth
    
    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: '/sales',
        },
      })
    }
    
    // Check if user has access to sales management
    const userHasAccess = hasAccess(user, 'sales')
    if (!userHasAccess) {
      throw redirect({
        to: '/403',
      })
    }
    
    // Operator is allowed to access sales page but only for transactions
    // No redirect needed for operators
  },
})