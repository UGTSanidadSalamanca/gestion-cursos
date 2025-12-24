"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Metric {
  label: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  description?: string
}

interface MetricsCardProps {
  title: string
  metrics: Metric[]
  className?: string
}

export function MetricsCard({ title, metrics, className }: MetricsCardProps) {
  const getChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                {metric.icon && (
                  <div className="text-muted-foreground">
                    {metric.icon}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getChangeColor(metric.changeType)}`}
                  >
                    {getChangeIcon(metric.changeType)}
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </Badge>
                )}
              </div>
              
              {metric.description && (
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}