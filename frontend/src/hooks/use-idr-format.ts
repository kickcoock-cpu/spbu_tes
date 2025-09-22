import { useCallback } from 'react'

export const useIDRFormat = () => {
  const formatIDR = useCallback((value: number): string => {
    if (!value) return '0'
    return new Intl.NumberFormat('id-ID').format(value)
  }, [])

  const parseIDR = useCallback((value: string): number => {
    if (!value) return 0
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '')
    return parseInt(cleanValue) || 0
  }, [])

  return { formatIDR, parseIDR }
}