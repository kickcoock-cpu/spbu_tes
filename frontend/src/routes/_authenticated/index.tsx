import { createFileRoute, redirect } from '@tanstack/react-router'
import DashboardPage from '@/features/dashboard/dashboard-page'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    // Get user data from localStorage (same as in auth store)
    try {
      const storedUser = localStorage.getItem('userData')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        
        // Check if user data is still valid (not expired)
        const currentTime = Math.floor(Date.now() / 1000)
        if (parsedUser.exp && parsedUser.exp > currentTime) {
          // Redirect operators to /sales as their home page
          if (parsedUser.role && parsedUser.role.includes('Operator')) {
            throw redirect({
              to: '/sales',
            })
          }
        }
      }
    } catch (e) {
      // If there's an error parsing user data, continue to dashboard
      console.error('Error parsing user data:', e)
    }
  },
  component: DashboardPage,
})
