import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChartIcon, 
  TruckIcon, 
  LandmarkIcon, 
  CalendarIcon,
  LayoutDashboardIcon,
  FileTextIcon
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { hasAccess, hasFullAccess, hasLimitedAccess } from '@/lib/rbac'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileReportsList } from './components/mobile-reports-list'

const ReportsPage = () => {
  const { user } = useAuthStore().auth
  const isMobile = useIsMobile()
  
  // Check if user has access to reports
  const userHasAccess = user ? hasAccess(user, 'reports') : false
  const userHasFullAccess = user ? hasFullAccess(user, 'reports') : false
  const userHasLimitedAccess = user ? hasLimitedAccess(user, 'reports') : false
  
  // If user doesn't have access, don't render anything
  if (!user || !userHasAccess) {
    return null
  }
  
  const reportCards = [
    {
      id: 'overview',
      title: 'All Reports Overview',
      description: 'View all reports in a single comprehensive dashboard',
      icon: <LayoutDashboardIcon className="h-6 w-6" />,
      route: '/reports',
      permission: 'reports'
    },
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'View detailed sales transactions and revenue reports',
      icon: <BarChartIcon className="h-6 w-6" />,
      route: '/reports/sales',
      permission: 'reports'
    },
    {
      id: 'deliveries',
      title: 'Deliveries Report',
      description: 'Track fuel deliveries and supplier performance',
      icon: <TruckIcon className="h-6 w-6" />,
      route: '/reports/deliveries',
      permission: 'reports'
    },
    {
      id: 'deposits',
      title: 'Deposits Report',
      description: 'Monitor cash deposits and financial transactions',
      icon: <LandmarkIcon className="h-6 w-6" />,
      route: '/reports/deposits',
      permission: 'reports'
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Review staff attendance and working hours',
      icon: <CalendarIcon className="h-6 w-6" />,
      route: '/reports/attendance',
      permission: 'reports'
    },
    {
      id: 'adjustments',
      title: 'Adjustment Report',
      description: 'Review adjustment requests and approvals',
      icon: <FileTextIcon className="h-6 w-6" />,
      route: '/reports/adjustment',
      permission: 'reports'
    }
  ]
  
  // Mobile view
  if (isMobile) {
    return (
      <MobileReportsList
        reportCards={reportCards}
        userHasFullAccess={userHasFullAccess}
        userHasLimitedAccess={userHasLimitedAccess}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          {userHasFullAccess 
            ? 'Access all reports and analytics' 
            : userHasLimitedAccess 
              ? 'Limited report access' 
              : 'View reports and analytics'}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {reportCards.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                {report.icon}
              </div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={report.route}>
                <Button className="w-full">
                  View Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReportsPage