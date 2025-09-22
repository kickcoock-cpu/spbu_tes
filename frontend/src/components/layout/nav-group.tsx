import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

export function NavGroup({ title, items, className, ...props }: NavGroupProps & { className?: string }) {
  const { state, isMobile } = useSidebar()
  const href = useLocation({ select: (location) => location.href })
  return (
    <SidebarGroup className={className || ''} {...props}>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} style={{ animationDelay: `${index * 0.05}s` }} />

          if (state === 'collapsed' && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} style={{ animationDelay: `${index * 0.05}s` }} />
            )

          return <SidebarMenuCollapsible key={key} item={item} href={href} style={{ animationDelay: `${index * 0.05}s` }} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}

function SidebarMenuLink({ item, href, style }: { item: NavLink; href: string; style?: React.CSSProperties }) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)
  
  return (
    <SidebarMenuItem style={style} className="sidebar-slide-in">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={isActive ? 'sidebar-highlight' : ''}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.classList.add('sidebar-pulse')
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.classList.remove('sidebar-pulse')
        }}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  href,
  style,
}: {
  item: NavCollapsible
  href: string
  style?: React.CSSProperties
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)
  
  return (
    <Collapsible
      asChild
      defaultOpen={isActive}
      className='group/collapsible'
    >
      <SidebarMenuItem style={style} className="sidebar-slide-in">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip={item.title}
            className={isActive ? 'sidebar-highlight' : ''}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.classList.add('sidebar-pulse')
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('sidebar-pulse')
            }}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub>
            {item.items.map((subItem, index) => {
              const isSubActive = checkIsActive(href, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title} style={{ animationDelay: `${index * 0.03}s` }} className="sidebar-slide-in">
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={isSubActive ? 'sidebar-highlight' : ''}
                    onMouseEnter={(e) => {
                      if (!isSubActive) {
                        e.currentTarget.classList.add('sidebar-pulse')
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.classList.remove('sidebar-pulse')
                    }}
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
  style,
}: {
  item: NavCollapsible
  href: string
  style?: React.CSSProperties
}) {
  const isActive = checkIsActive(href, item)
  
  return (
    <SidebarMenuItem style={style} className="sidebar-slide-in">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={isActive ? 'sidebar-highlight' : ''}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.classList.add('sidebar-pulse')
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('sidebar-pulse')
            }}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='right' align='start' sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub, index) => {
            const isSubActive = checkIsActive(href, sub)
            return (
              <DropdownMenuItem 
                key={`${sub.title}-${sub.url}`} 
                asChild
                className={isSubActive ? 'sidebar-highlight' : ''}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <Link
                  to={sub.url}
                  className={`${isSubActive ? 'bg-secondary' : ''}`}
                >
                  {sub.icon && <sub.icon />}
                  <span className='max-w-52 text-wrap'>{sub.title}</span>
                  {sub.badge && (
                    <span className='ms-auto text-xs'>{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}
