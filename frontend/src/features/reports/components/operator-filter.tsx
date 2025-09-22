import React from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface OperatorFilterProps {
  operators: string[]
  selectedOperator: string
  onOperatorChange: (operator: string) => void
  placeholder?: string
  className?: string
}

export const OperatorFilter: React.FC<OperatorFilterProps> = ({
  operators,
  selectedOperator,
  onOperatorChange,
  placeholder = "All Operators",
  className = ""
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor="operator-filter">Operator</Label>
      <Select value={selectedOperator} onValueChange={onOperatorChange}>
        <SelectTrigger className="py-5">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Operators</SelectItem>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>
              {operator}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}