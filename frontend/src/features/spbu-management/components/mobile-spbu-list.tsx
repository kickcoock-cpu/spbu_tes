import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, MapPin, Hash, Building } from 'lucide-react'

interface SPBU {
  id: number
  name: string
  location: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MobileSPBUListProps {
  spbus: SPBU[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddSPBU: () => void
  onEditSPBU: (spbu: SPBU) => void
  onDeleteSPBU: (id: number) => void
  isLoading: boolean
  isError: boolean
  isReadOnly: boolean
}

export const MobileSPBUList: React.FC<MobileSPBUListProps> = ({
  spbus,
  searchTerm,
  onSearchChange,
  onAddSPBU,
  onEditSPBU,
  onDeleteSPBU,
  isLoading,
  isError,
  isReadOnly
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-base">Loading SPBUs...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Error Loading Data</div>
          <div className="text-gray-600 mb-4 text-sm">
            Failed to load SPBU data. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section title with improved spacing */}
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">SPBU Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isReadOnly ? 'View SPBUs in the system' : 'Manage SPBUs'}
        </p>
      </div>

      {/* Search bar with enhanced styling and spacing */}
      <div className="px-4">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search SPBUs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full shadow-sm py-5"
          />
        </div>
        
        {!isReadOnly && (
          <Button onClick={onAddSPBU} className="w-full mt-4 py-5">
            <Plus className="mr-2 h-4 w-4" />
            Add SPBU
          </Button>
        )}
      </div>

      {/* SPBU list with improved spacing and visual hierarchy */}
      <div className="px-4 flex flex-col gap-4 pb-4">
        {spbus.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm ? 'No SPBUs found matching your search' : 'No SPBUs available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          spbus.map((spbu) => (
            <Card key={spbu.id} className="overflow-hidden shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <CardTitle className="text-lg truncate">{spbu.name}</CardTitle>
                      <CardDescription className="text-sm truncate">#{spbu.code}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={spbu.is_active ? "default" : "destructive"}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    {spbu.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">Location</span>
                    <span className="truncate flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {spbu.location}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-muted-foreground text-xs">ID</span>
                    <span className="truncate">#{spbu.id}</span>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <div className="flex gap-3 mt-5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onEditSPBU(spbu)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 py-5"
                      onClick={() => onDeleteSPBU(spbu.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}