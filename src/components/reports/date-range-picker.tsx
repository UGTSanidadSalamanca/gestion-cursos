"use client"

import { useState } from "react"
import { Calendar, CalendarDays, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  onExport: (format: 'pdf' | 'excel') => void
}

export function DateRangePicker({ onDateRangeChange, onExport }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [preset, setPreset] = useState<string>("this-month")

  const presets = [
    { value: "today", label: "Hoy", startDate: new Date(), endDate: new Date() },
    { value: "this-week", label: "Esta semana", startDate: new Date(new Date().setDate(new Date().getDate() - 7)), endDate: new Date() },
    { value: "this-month", label: "Este mes", startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), endDate: new Date() },
    { value: "last-month", label: "Mes pasado", startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0) },
    { value: "this-year", label: "Este año", startDate: new Date(new Date().getFullYear(), 0, 1), endDate: new Date() },
    { value: "last-year", label: "Año pasado", startDate: new Date(new Date().getFullYear() - 1, 0, 1), endDate: new Date(new Date().getFullYear() - 1, 11, 31) }
  ]

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const presetData = presets.find(p => p.value === value)
    if (presetData) {
      setStartDate(presetData.startDate)
      setEndDate(presetData.endDate)
      onDateRangeChange(presetData.startDate, presetData.endDate)
    }
  }

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Rango de Fechas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Período Predefinido</label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un período" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha Fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleApply} className="flex-1">
            Aplicar
          </Button>
        </div>

        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Exportar Reporte</label>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onExport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onExport('excel')}
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}