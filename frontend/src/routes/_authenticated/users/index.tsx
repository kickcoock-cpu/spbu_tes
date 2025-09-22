import { createFileRoute } from '@tanstack/react-router'
import UserManagementPage from '@/features/user-management/user-management-page'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UserManagementPage,
})