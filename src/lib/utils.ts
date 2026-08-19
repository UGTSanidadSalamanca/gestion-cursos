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

