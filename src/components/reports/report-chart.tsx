"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ReportChartProps {
  title: string
  description?: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
  categories: string[]
  xAxisKey: string
  yAxisKey: string
  color?: string
}

export function ReportChart({
  title,
  description,
  type,
  data,
  categories,
  xAxisKey,
  yAxisKey,
  color = "#8884d8"
}: ReportChartProps) {
  const chartConfig = {
    [yAxisKey]: {
      label: categories[0] || yAxisKey,
      color: color
    }
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={yAxisKey} fill={color} />
            </BarChart>
          </ChartContainer>
        )
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={yAxisKey} stroke={color} strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        )
      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={color}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        )
      case 'area':
        return (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey={yAxisKey} stroke={color} fill={color} fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>
        )
      default:
        return null
    }
  }

  // Importaciones dinámicas para evitar problemas de SSR
  const [BarChart, setBarChart] = useState<any>(null)
  const [LineChart, setLineChart] = useState<any>(null)
  const [PieChart, setPieChart] = useState<any>(null)
  const [AreaChart, setAreaChart] = useState<any>(null)
  const [Bar, setBar] = useState<any>(null)
  const [Line, setLine] = useState<any>(null)
  const [Pie, setPie] = useState<any>(null)
  const [Area, setArea] = useState<any>(null)
  const [CartesianGrid, setCartesianGrid] = useState<any>(null)
  const [XAxis, setXAxis] = useState<any>(null)
  const [YAxis, setYAxis] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('recharts').then(mod => {
          setBarChart(() => mod.BarChart)
          setLineChart(() => mod.LineChart)
          setPieChart(() => mod.PieChart)
          setAreaChart(() => mod.AreaChart)
          setBar(() => mod.Bar)
          setLine(() => mod.Line)
          setPie(() => mod.Pie)
          setArea(() => mod.Area)
          setCartesianGrid(() => mod.CartesianGrid)
          setXAxis(() => mod.XAxis)
          setYAxis(() => mod.YAxis)
        })
      ])
    }
  }, [])

  if (!BarChart || !LineChart || !PieChart || !AreaChart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}