import { useQuery, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'
import { type ApiMenuItem } from '@/components/layout/types'

// Hook to fetch menu data
export function useMenu() {
  const { user, accessToken } = useAuthStore((state) => state.auth)
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menu', user?.role],
    queryFn: async () => {
      const response = await menuApi.getMenu()
      return response.data.data as ApiMenuItem[]
    },
    enabled: !!user && !!accessToken, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
  })

  return {
    menuItems: data || [],
    isLoading,
    error,
    refetch,
  }
}

// Hook to refresh menu when user role changes
export function useMenuRefresh() {
  const queryClient = useQueryClient()
  const { user, accessToken } = useAuthStore((state) => state.auth)
  
  useEffect(() => {
    if (user && accessToken) {
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    }
  }, [user, accessToken, queryClient])
}