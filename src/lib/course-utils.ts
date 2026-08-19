import { db } from '@/lib/db'

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
 * Deactivates all courses that are currently marked as active (isActive = true)
 * but whose endDate is in the past (< today at 00:00:00).
 */
export async function deactivateExpiredCourses() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find active courses whose endDate is strictly before today
    const expiredActiveCourses = await db.course.findMany({
      where: {
        isActive: true,
        endDate: {
          not: null,
          lt: today
        }
      },
      select: {
        id: true,
        title: true,
        code: true,
        endDate: true
      }
    })

    if (expiredActiveCourses.length > 0) {
      const ids = expiredActiveCourses.map((c) => c.id)
      await db.course.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          isActive: false
        }
      })
      console.log(`[Auto-deactivate] Deactivated ${expiredActiveCourses.length} expired course(s):`, ids)
    }

    return {
      deactivatedCount: expiredActiveCourses.length,
      courses: expiredActiveCourses
    }
  } catch (error) {
    console.error('Error auto-deactivating expired courses:', error)
    return {
      deactivatedCount: 0,
      courses: []
    }
  }
}
