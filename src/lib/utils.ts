import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeUTC(dateStr: string | Date) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Checks if a course's end date has passed (yesterday or earlier).
 */
export function isCourseExpired(endDate?: Date | string | null): boolean {
  if (!endDate) return false
  const end = new Date(endDate)
  if (isNaN(end.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetEnd = new Date(end)
  targetEnd.setHours(0, 0, 0, 0)

  return targetEnd < today
}

/**
 * Formatea un importe o precio.
 * Si el número no tiene decimales (es entero), no muestra decimales (ej. 50).
 * Si tiene decimales, muestra hasta 2 decimales (ej. 50.50 o 33.33).
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'

  const rounded = Math.round(num * 100) / 100
  if (rounded % 1 === 0) {
    return rounded.toFixed(0)
  }
  return rounded.toFixed(2)
}

