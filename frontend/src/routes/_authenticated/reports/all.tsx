import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reports/all')({
  beforeLoad: () => {
    // Redirect to the main reports page
    throw redirect({
      to: '/reports',
    })
  },
})