import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess } from '@/lib/rbac'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { user } = useAuthStore.getState().auth
    
    // Check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
    
    // Check if user has access to any part of the application
    // Operators may not have dashboard access but can access other features
    const userHasAnyAccess = hasAccess(user, 'sales') || 
                             hasAccess(user, 'deliveries') || 
                             hasAccess(user, 'deposits') || 
                             hasAccess(user, 'attendance') ||
                             hasAccess(user, 'adjustments') ||
                             hasAccess(user, 'prices') ||
                             hasAccess(user, 'reports') ||
                             hasAccess(user, 'tanks') ||
                             hasAccess(user, 'dashboard');
                             
    if (!userHasAnyAccess) {
      throw redirect({
        to: '/403',
      })
    }
  },
  component: AuthenticatedLayout,
})
