import { createFileRoute } from '@tanstack/react-router'
import PredictionsPage from '@/features/predictions/predictions-page'

export const Route = createFileRoute('/_authenticated/prediction/deliveries/')({
  component: () => <PredictionsPage />,
})