import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

// Lazy load the component
const SalesManagementPage = lazy(() => import('@/features/sales-management/sales-management-page.tsx'))

export const Route = createFileRoute('/_authenticated/sales/')({
  component: SalesManagementPage,
})