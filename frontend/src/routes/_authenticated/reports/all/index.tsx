import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reports/all/')({
  component: () => import('@/features/reports/all-reports-page').then(m => m.default),
})