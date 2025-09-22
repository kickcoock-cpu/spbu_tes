import React, { useState } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, Users } from 'lucide-react'

interface MultiOperatorFilterProps {
  operators: string[]
  selectedOperators: string[]
  onOperatorChange: (operators: string[]) => void
  placeholder?: string
  className?: string
}

export const MultiOperatorFilter: React.FC<MultiOperatorFilterProps> = ({
  operators,
  selectedOperators,
  onOperatorChange,
  placeholder = "Select Operators",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOperatorToggle = (operator: string) => {
    if (selectedOperators.includes(operator)) {
      onOperatorChange(selectedOperators.filter(op => op !== operator))
    } else {
      onOperatorChange([...selectedOperators, operator])
    }
  }

  const handleSelectAll = () => {
    if (selectedOperators.length === operators.length) {
      // If all are selected, deselect all
      onOperatorChange([])
    } else {
      // If not all are selected, select all
      onOperatorChange([...operators])
    }
  }

  const displayText = selectedOperators.length === 0 
    ? placeholder 
    : selectedOperators.length === 1
    ? selectedOperators[0]
    : `${selectedOperators.length} of ${operators.length} selected`

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor="operator-filter" className="text-xs flex items-center gap-1">
        <Users className="h-3 w-3" />
        Operators
      </Label>
      <div className="relative">
        <Select open={isOpen} onOpenChange={setIsOpen}>
          <SelectTrigger 
            className="h-9 w-full pr-8"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="truncate">{displayText}</span>
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto w-full min-w-[var(--radix-select-trigger-width)]">
            <div className="p-1 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectAll()
                }}
              >
                <Checkbox 
                  id="select-all" 
                  className="mr-2 h-4 w-4"
                  checked={selectedOperators.length === operators.length && operators.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  {selectedOperators.length === operators.length && operators.length > 0 
                    ? "Deselect All" 
                    : "Select All"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  ({operators.length})
                </span>
              </Button>
            </div>
            {operators.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                {operators.map((operator) => (
                  <div 
                    key={operator} 
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOperatorToggle(operator)
                    }}
                  >
                    <Checkbox 
                      id={operator} 
                      className="h-4 w-4"
                      checked={selectedOperators.includes(operator)}
                      onCheckedChange={() => handleOperatorToggle(operator)}
                    />
                    <label 
                      htmlFor={operator} 
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate"
                    >
                      {operator}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No operators available
              </div>
            )}
          </SelectContent>
        </Select>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
    </div>
  )
}