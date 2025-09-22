import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BarChartIcon, 
  TruckIcon, 
  LandmarkIcon, 
  CalendarIcon,
  LayoutDashboardIcon,
  SearchIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  ClockIcon,
  FilterIcon,
  FileTextIcon
} from 'lucide-react'

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  permission: string
}

interface MobileReportsListProps {
  reportCards: ReportCard[]
  userHasFullAccess: boolean
  userHasLimitedAccess: boolean
}

export const MobileReportsList: React.FC<MobileReportsListProps> = ({
  reportCards,
  userHasFullAccess,
  userHasLimitedAccess
}) => {
  // Filter out the 'overview' card since we're making it the main page
  const filteredReportCards = reportCards.filter(card => card.id !== 'overview');
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reports based on search term
  const filteredReports = filteredReportCards.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {userHasFullAccess 
            ? 'Access all reports and analytics' 
            : userHasLimitedAccess 
              ? 'Limited report access' 
              : 'View reports and analytics'}
        </p>
        {/* Permission indicator */}
        <div className="mt-2">
          <Badge variant={userHasFullAccess ? "default" : userHasLimitedAccess ? "secondary" : "outline"} className="text-xs">
            {userHasFullAccess ? 'Full Access' : userHasLimitedAccess ? 'Limited Access' : 'Read Only'}
          </Badge>
        </div>
      </div>
      
      {/* Search and Quick Actions */}
      <div className="px-4">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {/* Quick Stats Panel */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                  <p className="font-bold">{filteredReportCards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Pending Actions</p>
                  <p className="font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Reports list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden shadow-sm border-2 border-transparent hover:border-blue-200 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <Link to={report.route}>
                <Button className="w-full py-5 text-base">
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