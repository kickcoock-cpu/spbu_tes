import { createFileRoute } from '@tanstack/react-router'
import { MobileDashboardShowcase } from '@/features/dashboard/components/mobile-dashboard-showcase'

export const Route = createFileRoute('/_authenticated/mobile-dashboard')({
  component: () => (
    <div className="p-4">
      <MobileDashboardShowcase />
    </div>
  )
})