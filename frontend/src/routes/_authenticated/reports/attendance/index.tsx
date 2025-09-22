import { createFileRoute } from '@tanstack/react-router'
import AttendanceReportPage from '@/features/reports/attendance-report-page'

export const Route = createFileRoute('/_authenticated/reports/attendance/')({
  component: AttendanceReportPage,
})