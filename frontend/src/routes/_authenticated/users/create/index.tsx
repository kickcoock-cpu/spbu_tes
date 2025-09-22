import { createFileRoute } from '@tanstack/react-router'
import { CreateUserPage } from '@/features/user-management/components/create-user-page'

export const Route = createFileRoute('/_authenticated/users/create/')({
  component: CreateUserPage,
})