import { type LinkProps } from '@tanstack/react-router'

type User = {
  name: string
  email: string
  avatar: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  navGroups: NavGroup[]
}

// API Menu Item type
type ApiMenuItem = {
  id: string
  label: string
  icon: string
  route: string
  permission: string
  readOnly?: boolean
  limited?: boolean
  submenu?: ApiMenuItem[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, ApiMenuItem }
